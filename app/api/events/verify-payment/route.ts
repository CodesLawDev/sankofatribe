import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/auth-utils';
import { serverClient } from '@/lib/sanity-server';
import { sendSMS } from '@/lib/sms-service';
import hubtelService from '@/lib/hubtel';
import QRCode from 'qrcode';

const prisma = getPrisma();

interface AttendeeInfo {
  name: string;
  email: string;
  phone: string;
}

// =============================================================================
// Shared ticket generation logic
// =============================================================================

async function generateTickets(orderId: string, attendees: AttendeeInfo[]) {
  const order = await prisma.eventTicketOrder.findUnique({
    where: { id: orderId },
    include: { tier: true },
  });

  if (!order) {
    return { error: 'Order not found', status: 404 };
  }

  // Fetch event details
  const eventQuery = `*[_type == "event" && _id == $eventId][0] {
    _id, title, slug, eventDate, endDate, venue, address, city,
    "imageUrl": image.asset->url
  }`;
  const event = await serverClient.fetch(eventQuery, { eventId: order.eventId });
  if (!event) {
    return { error: 'Event not found', status: 404 };
  }

  // Check existing tickets
  const existingTickets = await prisma.eventTicket.findMany({
    where: { orderId: order.id },
  });
  if (existingTickets.length > 0) {
    return { success: true, orderId: order.id, tickets: existingTickets, event, alreadyGenerated: true, tier: order.tier };
  }

  // Generate tickets
  const eventAbbrev = event.title
    .split(' ')
    .filter((word: string) => word.length > 2)
    .slice(0, 3)
    .map((word: string) => word[0].toUpperCase())
    .join('');

  const lastTicket = await prisma.eventTicket.findFirst({
    where: { eventId: order.eventId },
    orderBy: { ticketId: 'desc' },
    take: 1,
  });

  let nextTicketNumber = 1;
  if (lastTicket?.ticketId) {
    const match = lastTicket.ticketId.match(/(\d+)$/);
    if (match) nextTicketNumber = parseInt(match[1], 10) + 1;
  }

  const ticketDataArray = await Promise.all(
    attendees.map(async (attendee, index) => {
      const ticketNumber = String(nextTicketNumber + index).padStart(3, '0');
      const ticketId = `${eventAbbrev}-${ticketNumber}`;
      const qrCodeData = JSON.stringify({
        ticketId, eventId: order.eventId,
        attendeeName: attendee.name, attendeeEmail: attendee.email,
      });
      const qrCodeUrl = await QRCode.toDataURL(qrCodeData, {
        errorCorrectionLevel: 'H', width: 400, margin: 2,
      });
      return {
        ticketId, orderId: order.id, eventId: order.eventId, tierId: order.tierId,
        attendeeName: attendee.name, attendeeEmail: attendee.email,
        attendeePhone: attendee.phone, qrCode: qrCodeUrl, status: 'AVAILABLE' as const,
      };
    })
  );

  // Batch-insert all tickets at once
  let tickets;
  try {
    await prisma.eventTicket.createMany({ data: ticketDataArray, skipDuplicates: true });
    tickets = await prisma.eventTicket.findMany({
      where: { orderId: order.id },
      orderBy: { ticketId: 'asc' },
    });
  } catch (error: any) {
    console.error('Ticket creation error:', error);
    // Fallback: if createMany fails, tickets may already exist
    tickets = await prisma.eventTicket.findMany({
      where: { orderId: order.id },
      orderBy: { ticketId: 'asc' },
    });
    if (tickets.length === 0) throw error;
  }

  // Update order + tier
  await prisma.eventTicketOrder.update({
    where: { id: order.id },
    data: { paymentStatus: 'success' },
  });
  await prisma.eventTicketTier.update({
    where: { id: order.tierId },
    data: { sold: { increment: order.ticketCount } },
  });

  // SMS
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sankofatribe.com';
  if (order.buyerPhone && tickets.length > 0) {
    try {
      const ticketList = tickets.map((t: any) => t.ticketId).join(', ');
      const downloadLink = `${baseUrl}/api/tickets/${tickets[0].ticketId}?format=image`;
      const smsMessage = `SANKOFA TRIBE\n\n${event.title}\n${new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\n\nTicket(s): ${ticketList}\n\nDownload: ${downloadLink}`;
      await sendSMS(order.buyerPhone, smsMessage);
    } catch (smsError) {
      console.error('SMS send failed:', smsError);
    }
  }

  return {
    success: true, orderId: order.id, tickets, event, alreadyGenerated: false,
    tier: order.tier,
  };
}

/** Build a unified response with full ticket+order data so the client doesn't need extra fetches */
function buildTicketsResponse(
  result: any,
  baseUrl: string,
  orderOverride?: { orderId: string; buyerName: string; totalAmount: any; currency: string }
) {
  const orderInfo = orderOverride || {
    orderId: result.orderId,
    buyerName: result.tickets?.[0]?.attendeeName || '',
    totalAmount: 0,
    currency: 'GHS',
  };
  return {
    success: true,
    orderId: result.orderId,
    event: result.event ? {
      title: result.event.title, date: result.event.eventDate,
      venue: result.event.venue, imageUrl: result.event.imageUrl,
    } : undefined,
    tickets: result.tickets?.map((t: any) => ({
      ticket: {
        ticketId: t.ticketId,
        eventId: t.eventId,
        attendeeName: t.attendeeName,
        attendeeEmail: t.attendeeEmail,
        attendeePhone: t.attendeePhone,
        tierName: result.tier?.name || '',
        tierDescription: result.tier?.description || '',
        status: t.status,
        qrCode: t.qrCode,
        createdAt: t.createdAt,
      },
      order: {
        orderId: orderInfo.orderId,
        buyerName: orderInfo.buyerName,
        totalAmount: Number(orderInfo.totalAmount),
        currency: orderInfo.currency,
        paymentStatus: 'success',
      },
    })),
    message: result.alreadyGenerated ? 'Tickets already generated' : 'Tickets generated successfully.',
  };
}

// =============================================================================
// POST /api/events/verify-payment
// Supports both Paystack (reference) and Hubtel (clientReference + provider)
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference, provider = 'paystack', clientReference } = body;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sankofatribe.com';

    // ---- Hubtel ----
    if (provider === 'hubtel') {
      const orderId = clientReference || reference;
      if (!orderId) {
        return NextResponse.json({ error: 'Client reference is required' }, { status: 400 });
      }

      // Check order — may need to wait for GET handler or webhook to mark it paid
      let order = await prisma.eventTicketOrder.findUnique({
        where: { id: orderId },
        include: { tickets: true, tier: true },
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // If already confirmed, skip all waiting
      // Otherwise try Hubtel status API, then short wait + re-check
      if (order.paymentStatus !== 'success') {
        try {
          const hubtelResult = await hubtelService.checkStatus(orderId);
          if (hubtelResult.success) {
            await prisma.eventTicketOrder.update({
              where: { id: orderId },
              data: { paymentStatus: 'success' },
            });
          }
        } catch (err) {
          console.error('Hubtel status check failed:', err instanceof Error ? err.message : err);
        }

        // Brief wait then re-fetch to pick up webhook or status update
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Definitive re-fetch after all waiting / status checks
      const confirmedOrder = await prisma.eventTicketOrder.findUnique({
        where: { id: orderId },
        include: { tickets: true, tier: true },
      });
      if (!confirmedOrder) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      if (confirmedOrder.paymentStatus !== 'success') {
        return NextResponse.json(
          { error: 'Payment not yet confirmed. Please wait a moment and try again.', retryable: true },
          { status: 400 }
        );
      }

      // Tickets already generated?
      if (confirmedOrder.tickets.length > 0) {
        const orderInfo = {
          orderId: confirmedOrder.id,
          buyerName: confirmedOrder.buyerName,
          totalAmount: confirmedOrder.totalAmount,
          currency: confirmedOrder.currency,
        };
        const eventQuery = `*[_type == "event" && _id == $eventId][0] { _id, title, eventDate, venue, "imageUrl": image.asset->url }`;
        const evt = await serverClient.fetch(eventQuery, { eventId: confirmedOrder.eventId });
        return NextResponse.json(
          buildTicketsResponse(
            { orderId: confirmedOrder.id, tickets: confirmedOrder.tickets, event: evt, alreadyGenerated: true, tier: confirmedOrder.tier ?? undefined },
            baseUrl,
            orderInfo
          )
        );
      }

      // Read attendees from the database (stored at purchase time)
      let attendees: AttendeeInfo[] = [];
      if (confirmedOrder.attendees) {
        attendees = confirmedOrder.attendees as unknown as AttendeeInfo[];
      } else if (body.attendees && Array.isArray(body.attendees)) {
        // Fallback: accept from request body
        attendees = body.attendees;
      }
      if (!attendees.length) {
        return NextResponse.json(
          { error: 'Attendees information not found for this order' },
          { status: 400 }
        );
      }

      const result = await generateTickets(orderId, attendees);
      if ('error' in result) {
        return NextResponse.json({ error: result.error }, { status: result.status || 500 });
      }

      return NextResponse.json(
        buildTicketsResponse(result, baseUrl, {
          orderId: confirmedOrder.id,
          buyerName: confirmedOrder.buyerName,
          totalAmount: confirmedOrder.totalAmount,
          currency: confirmedOrder.currency,
        })
      );
    }

    // ---- Paystack (default) ----
    if (!reference) {
      return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 });
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return NextResponse.json({ error: 'Payment configuration error' }, { status: 500 });
    }

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${paystackSecretKey}` } }
    );
    const verifyData = await verifyResponse.json();

    if (!verifyData.status || verifyData.data.status !== 'success') {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const metadata = verifyData.data.metadata;
    if (!metadata?.orderId) {
      return NextResponse.json({ error: 'Invalid payment metadata - missing order ID' }, { status: 400 });
    }

    // Read attendees from the database (stored at purchase time)
    const paystackOrder = await prisma.eventTicketOrder.findUnique({ where: { id: metadata.orderId } });
    let attendees: AttendeeInfo[] = [];
    if (paystackOrder?.attendees) {
      attendees = paystackOrder.attendees as unknown as AttendeeInfo[];
    } else if (metadata?.attendees) {
      try { attendees = JSON.parse(metadata.attendees); } catch {}
    }
    if (!attendees.length) {
      return NextResponse.json({ error: 'Attendees information not found for this order' }, { status: 400 });
    }

    const result = await generateTickets(metadata.orderId, attendees);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 });
    }

    return NextResponse.json(
      buildTicketsResponse(result, baseUrl, paystackOrder ? {
        orderId: paystackOrder.id,
        buyerName: paystackOrder.buyerName,
        totalAmount: paystackOrder.totalAmount,
        currency: paystackOrder.currency,
      } : undefined)
    );
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
