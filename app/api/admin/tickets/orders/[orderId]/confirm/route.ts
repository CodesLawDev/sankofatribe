import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/auth-utils';
import { serverClient } from '@/lib/sanity-server';
import { sendSMS } from '@/lib/sms-service';
import QRCode from 'qrcode';
import { verifyHubtelPayment } from '@/lib/hubtel';

const prisma = getPrisma();

interface AttendeeInfo {
  name: string;
  email: string;
  phone: string;
}

/**
 * POST /api/admin/tickets/orders/[orderId]/confirm
 * Manually confirm a pending order - verifies with payment provider and generates tickets
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    // Get order
    const order = await prisma.eventTicketOrder.findUnique({
      where: { id: orderId },
      include: { tier: true, tickets: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.tickets.length > 0) {
      return NextResponse.json({ 
        error: 'Tickets already generated for this order',
        tickets: order.tickets.length 
      }, { status: 400 });
    }

    const normalizedProvider = (order.paymentMethod || 'paystack').toUpperCase();
    let attendees: AttendeeInfo[] | null = null;

    if (order.attendees && Array.isArray(order.attendees)) {
      // Validate that the attendees array matches the expected structure
      try {
        const parsed = order.attendees as unknown as AttendeeInfo[];
        const isValid = parsed.every(
          (item) =>
            item &&
            typeof item === 'object' &&
            typeof item.name === 'string' &&
            typeof item.email === 'string' &&
            typeof item.phone === 'string'
        );
        if (isValid) {
          attendees = parsed;
        }
      } catch {
        // Invalid attendees data, leave as null
      }
    }

    if (normalizedProvider === 'PAYSTACK') {
      // Verify with Paystack
      const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!paystackSecretKey) {
        return NextResponse.json({ error: 'Paystack not configured' }, { status: 500 });
      }

      const verifyResponse = await fetch(
        `https://api.paystack.co/transaction/verify/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
          },
        }
      );

      const verifyData = await verifyResponse.json();

      if (!verifyData.status) {
        return NextResponse.json({ 
          error: 'Transaction not found in Paystack',
          paystackMessage: verifyData.message 
        }, { status: 404 });
      }

      const paystackStatus = verifyData.data.status;
      
      if (paystackStatus !== 'success') {
        return NextResponse.json({ 
          error: `Payment not successful`,
          paystackStatus,
          message: `Paystack shows payment as "${paystackStatus}". Cannot confirm.`
        }, { status: 400 });
      }

      // Get attendees from metadata if not already stored
      const metadata = verifyData.data.metadata;
      if (!attendees && metadata?.attendees) {
        try {
          attendees = JSON.parse(metadata.attendees);
        } catch (e) {
          return NextResponse.json({ error: 'Failed to parse attendees' }, { status: 400 });
        }
      }
    } else if (normalizedProvider === 'HUBTEL') {
      const reference = order.paymentReference || order.id;
      const hubtelResult = await verifyHubtelPayment(reference);
      if (hubtelResult.status !== 'SUCCESS') {
        return NextResponse.json({
          error: 'Payment not successful',
          hubtelStatus: hubtelResult.status,
        }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Unsupported payment provider' }, { status: 400 });
    }

    if (!attendees || attendees.length === 0) {
      return NextResponse.json({ error: 'Missing attendees for this order' }, { status: 400 });
    }

    // Fetch event from Sanity
    const eventQuery = `*[_type == "event" && _id == $eventId][0] {
      _id,
      title,
      eventDate,
      venue
    }`;

    const event = await serverClient.fetch(eventQuery, { eventId: order.eventId });

    if (!event) {
      return NextResponse.json({ error: 'Event not found in Sanity' }, { status: 404 });
    }

    // Generate event abbreviation
    const eventAbbrev = event.title
      .split(' ')
      .filter((word: string) => word.length > 2)
      .slice(0, 3)
      .map((word: string) => word[0].toUpperCase())
      .join('');

    // Get highest ticket number
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
        status: 'AVAILABLE' as const,
      });
    }

    // Create tickets
    await prisma.eventTicket.createMany({
      data: ticketsToCreate,
      skipDuplicates: true,
    });

    // Update order status
    await prisma.eventTicketOrder.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'success',
        paymentMethod: normalizedProvider.toLowerCase(),
      },
    });

    // Update tier sold count
    await prisma.eventTicketTier.update({
      where: { id: order.tierId },
      data: { sold: { increment: order.ticketCount } },
    });

    // Send SMS notification
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sankofatribe.com';
    if (order.buyerPhone) {
      try {
        const ticketList = ticketsToCreate.map(t => t.ticketId).join(', ');
        const downloadLink = `${baseUrl}/api/tickets/${ticketsToCreate[0].ticketId}?format=image`;
        const smsMessage = `SANKOFA TRIBE\n\n${event.title}\n${new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\n\nTicket(s): ${ticketList}\n\nDownload: ${downloadLink}`;
        
        await sendSMS(order.buyerPhone, smsMessage);
      } catch (smsError) {
        console.error('SMS send failed:', smsError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Order confirmed. ${ticketsToCreate.length} ticket(s) generated.`,
      tickets: ticketsToCreate.map(t => ({
        ticketId: t.ticketId,
        attendeeName: t.attendeeName,
      })),
    });

  } catch (error) {
    console.error('Confirm order error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm order', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
