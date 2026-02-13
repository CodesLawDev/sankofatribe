import { PrismaClient, TicketStatus } from '@prisma/client';
import QRCode from 'qrcode';
import { serverClient } from '../lib/sanity-server';

const prisma = new PrismaClient();

// Orders with successful payments that need fixing
const ordersToFix = [
  'cmkxu7qnv000cjs04o7cnx6yr',
  'cmkxtzz860002i804zlkfkkz9', 
  'cmkvs1tre0005jo04kig4zqwb',
];

interface AttendeeInfo {
  name: string;
  email: string;
  phone: string;
}

async function fixPendingOrdersDirect() {
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecretKey) {
    console.error('ERROR: PAYSTACK_SECRET_KEY not configured');
    process.exit(1);
  }

  for (const orderId of ordersToFix) {
    // Get order details
    const order = await prisma.eventTicketOrder.findUnique({
      where: { id: orderId },
      include: { tier: true, tickets: true },
    });

    if (!order) {
      console.error(`Order not found: ${orderId}`);
      continue;
    }

    if (order.tickets.length > 0) {
      // Just update payment status if needed
      if (order.paymentStatus !== 'success') {
        await prisma.eventTicketOrder.update({
          where: { id: order.id },
          data: { paymentStatus: 'success' },
        });
      }
      continue;
    }

    // Verify with Paystack first
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const verifyData = await verifyResponse.json();
    
    if (!verifyData.status || verifyData.data.status !== 'success') {
      console.error(`Payment not successful on Paystack: ${verifyData.data?.status || 'not found'}`);
      continue;
    }

    // Get metadata
    const metadata = verifyData.data.metadata;
    if (!metadata || !metadata.attendees) {
      console.error('Missing attendees in metadata');
      continue;
    }

    let attendees: AttendeeInfo[];
    try {
      attendees = JSON.parse(metadata.attendees);
    } catch (e) {
      console.error('Failed to parse attendees:', e);
      continue;
    }

    // Fetch event from Sanity
    const eventQuery = `*[_type == "event" && _id == $eventId][0] {
      _id,
      title,
      slug,
      eventDate
    }`;
    
    let event;
    try {
      event = await serverClient.fetch(eventQuery, { eventId: order.eventId });
    } catch (e) {
      console.error('Failed to fetch event:', e);
      continue;
    }

    if (!event) {
      console.error('Event not found in Sanity');
      continue;
    }

    // Generate event abbreviation for ticket IDs
    const eventAbbrev = event.title
      .split(' ')
      .filter((word: string) => word.length > 2)
      .slice(0, 3)
      .map((word: string) => word[0].toUpperCase())
      .join('');

    // Get highest ticket number for this event
    const lastTicket = await prisma.eventTicket.findFirst({
      where: { eventId: order.eventId },
      orderBy: { ticketId: 'desc' },
      take: 1,
    });

    let nextTicketNumber = 1;
    if (lastTicket && lastTicket.ticketId) {
      const match = lastTicket.ticketId.match(/(\d+)$/);
      if (match) {
        nextTicketNumber = parseInt(match[1], 10) + 1;
      }
    }

    // Generate tickets
    const ticketsToCreate = [];
    for (let i = 0; i < attendees.length; i++) {
      const attendee = attendees[i];
      const ticketNumber = String(nextTicketNumber + i).padStart(3, '0');
      const ticketId = `${eventAbbrev}-${ticketNumber}`;

      // Generate QR code
      const qrCodeData = JSON.stringify({
        ticketId,
        eventId: order.eventId,
        attendeeName: attendee.name,
        attendeeEmail: attendee.email,
      });

      const qrCodeUrl = await QRCode.toDataURL(qrCodeData, {
        errorCorrectionLevel: 'H',
        width: 400,
        margin: 2,
      });

      ticketsToCreate.push({
        ticketId,
        orderId: order.id,
        eventId: order.eventId,
        tierId: order.tierId,
        attendeeName: attendee.name,
        attendeeEmail: attendee.email,
        attendeePhone: attendee.phone,
        qrCode: qrCodeUrl,
        status: 'AVAILABLE' as TicketStatus,
      });

    }

    // Insert tickets
    try {
      await prisma.eventTicket.createMany({
        data: ticketsToCreate,
      });
    } catch (e: any) {
      console.error(`Failed to create tickets: ${e.message}`);
      continue;
    }

    // Update order status
    await prisma.eventTicketOrder.update({
      where: { id: order.id },
      data: { paymentStatus: 'success' },
    });
    // Update tier sold count
    await prisma.eventTicketTier.update({
      where: { id: order.tierId },
      data: { sold: { increment: order.ticketCount } },
    });
  }

  await prisma.$disconnect();
}

fixPendingOrdersDirect().catch(console.error);
