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
  console.log('=== Fixing Pending Orders Directly ===\n');

  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecretKey) {
    console.error('ERROR: PAYSTACK_SECRET_KEY not configured');
    process.exit(1);
  }

  for (const orderId of ordersToFix) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing order: ${orderId}`);
    console.log('='.repeat(60));
    
    // Get order details
    const order = await prisma.eventTicketOrder.findUnique({
      where: { id: orderId },
      include: { tier: true, tickets: true },
    });

    if (!order) {
      console.log(`  Order not found!`);
      continue;
    }

    console.log(`  Buyer: ${order.buyerName} (${order.buyerEmail})`);
    console.log(`  Phone: ${order.buyerPhone}`);
    console.log(`  Event ID: ${order.eventId}`);
    console.log(`  Current payment status: ${order.paymentStatus}`);
    console.log(`  Tickets already generated: ${order.tickets.length}`);

    if (order.tickets.length > 0) {
      console.log(`  ⚠️ Tickets already exist - skipping ticket generation`);
      
      // Just update payment status if needed
      if (order.paymentStatus !== 'success') {
        await prisma.eventTicketOrder.update({
          where: { id: order.id },
          data: { paymentStatus: 'success' },
        });
        console.log(`  ✅ Updated payment status to success`);
      }
      continue;
    }

    // Verify with Paystack first
    console.log(`\n  Verifying payment with Paystack...`);
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
      console.log(`  ❌ Payment not successful on Paystack: ${verifyData.data?.status || 'not found'}`);
      continue;
    }

    console.log(`  ✅ Payment verified as SUCCESS on Paystack`);
    console.log(`  Amount: ${verifyData.data.amount / 100} ${verifyData.data.currency}`);
    console.log(`  Paid at: ${verifyData.data.paid_at}`);

    // Get metadata
    const metadata = verifyData.data.metadata;
    if (!metadata || !metadata.attendees) {
      console.log(`  ❌ Missing attendees in metadata`);
      continue;
    }

    let attendees: AttendeeInfo[];
    try {
      attendees = JSON.parse(metadata.attendees);
    } catch (e) {
      console.log(`  ❌ Failed to parse attendees: ${e}`);
      continue;
    }

    console.log(`  Attendees: ${attendees.length}`);
    for (const att of attendees) {
      console.log(`    - ${att.name} (${att.email})`);
    }

    // Fetch event from Sanity
    console.log(`\n  Fetching event details from Sanity...`);
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
      console.log(`  ❌ Failed to fetch event: ${e}`);
      continue;
    }

    if (!event) {
      console.log(`  ❌ Event not found in Sanity`);
      continue;
    }

    console.log(`  Event: ${event.title}`);

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

    console.log(`\n  Generating ${attendees.length} ticket(s)...`);
    console.log(`  Event abbreviation: ${eventAbbrev}`);
    console.log(`  Starting ticket number: ${nextTicketNumber}`);

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

      console.log(`    Created: ${ticketId} for ${attendee.name}`);
    }

    // Insert tickets
    try {
      await prisma.eventTicket.createMany({
        data: ticketsToCreate,
      });
      console.log(`  ✅ ${ticketsToCreate.length} ticket(s) saved to database`);
    } catch (e: any) {
      console.log(`  ❌ Failed to create tickets: ${e.message}`);
      continue;
    }

    // Update order status
    await prisma.eventTicketOrder.update({
      where: { id: order.id },
      data: { paymentStatus: 'success' },
    });
    console.log(`  ✅ Order payment status updated to 'success'`);

    // Update tier sold count
    await prisma.eventTicketTier.update({
      where: { id: order.tierId },
      data: { sold: { increment: order.ticketCount } },
    });
    console.log(`  ✅ Tier sold count incremented by ${order.ticketCount}`);

    console.log(`\n  🎉 ORDER FIXED SUCCESSFULLY!`);
  }

  // Final summary
  console.log('\n\n' + '='.repeat(60));
  console.log('FINAL STATUS CHECK');
  console.log('='.repeat(60));

  for (const orderId of ordersToFix) {
    const order = await prisma.eventTicketOrder.findUnique({
      where: { id: orderId },
      include: { tickets: true },
    });

    if (order) {
      console.log(`\n${order.buyerName} (${order.buyerEmail}):`);
      console.log(`  Payment Status: ${order.paymentStatus}`);
      console.log(`  Tickets: ${order.tickets.length}`);
      for (const t of order.tickets) {
        console.log(`    - ${t.ticketId}`);
      }
    }
  }

  await prisma.$disconnect();
}

fixPendingOrdersDirect().catch(console.error);
