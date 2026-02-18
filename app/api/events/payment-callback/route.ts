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
// Shared: generate tickets, update order, send SMS
// =============================================================================

async function fulfillTicketOrder(orderId: string, attendees: AttendeeInfo[], baseUrl: string) {
  const order = await prisma.eventTicketOrder.findUnique({
    where: { id: orderId },
    include: { tier: true, tickets: true },
  });

  if (!order) throw new Error(`Order not found: ${orderId}`);

  // Get event details
  const eventQuery = `*[_type == "event" && _id == $eventId][0] {
    _id, title, "slug": slug.current, eventDate, venue, "imageUrl": image.asset->url
  }`;
  const event = await serverClient.fetch(eventQuery, { eventId: order.eventId });
  if (!event) throw new Error(`Event not found: ${order.eventId}`);

  // Already processed?
  if (order.tickets.length > 0) {
    return { alreadyProcessed: true, event, order };
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
      return {
        ticketId,
        orderId: order.id,
        eventId: order.eventId,
        tierId: order.tierId,
        attendeeName: attendee.name,
        attendeeEmail: attendee.email,
        attendeePhone: attendee.phone,
        qrCode: qrCodeUrl,
        status: 'AVAILABLE' as const,
      };
    })
  );

  const tickets = [];
  for (const ticketData of ticketDataArray) {
    try {
      const ticket = await prisma.eventTicket.create({ data: ticketData });
      tickets.push(ticket);
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('ticketId')) {
        const existing = await prisma.eventTicket.findUnique({ where: { ticketId: ticketData.ticketId } });
        if (existing) tickets.push(existing);
      } else {
        throw error;
      }
    }
  }

  // Update order status
  await prisma.eventTicketOrder.update({
    where: { id: order.id },
    data: { paymentStatus: 'success' },
  });

  // Update sold count
  await prisma.eventTicketTier.update({
    where: { id: order.tierId },
    data: { sold: { increment: order.ticketCount } },
  });

  // Send SMS
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

  return { alreadyProcessed: false, event, order, tickets };
}

// =============================================================================
// GET — Browser redirect callback (Paystack redirect or Hubtel returnUrl)
// =============================================================================

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sankofatribe.com';
  const provider = searchParams.get('provider');

  try {
    // ---- Hubtel return URL ----
    if (provider === 'hubtel') {
      const clientReference = searchParams.get('clientReference');
      const eventSlug = searchParams.get('eventSlug');

      if (!clientReference) {
        return NextResponse.redirect(`${baseUrl}/events?error=missing_reference`);
      }

      // Look up order
      const order = await prisma.eventTicketOrder.findUnique({
        where: { id: clientReference },
        include: { tier: true, tickets: true },
      });

      if (!order) {
        return NextResponse.redirect(`${baseUrl}/events?error=order_not_found`);
      }

      // Already fully processed (webhook may have beaten us)
      if (order.tickets.length > 0) {
        const slug = eventSlug || await getEventSlug(order.eventId);
        return NextResponse.redirect(
          `${baseUrl}/events/${slug}/ticket-confirmation?reference=${clientReference}&provider=hubtel`
        );
      }

      // Determine if payment succeeded:
      // The webhook (POST) or status API should confirm payment.
      // Hubtel does NOT append status params to returnUrl, so we rely on:
      // 1. DB status (webhook may have set it already)
      // 2. Hubtel status check API (fallback)
      // 3. Wait + retry if neither confirms yet (race condition with webhook)
      let paymentConfirmed = order.paymentStatus === 'success';

      if (!paymentConfirmed) {
        // Wait briefly for webhook to arrive, then re-check
        for (let attempt = 0; attempt < 3 && !paymentConfirmed; attempt++) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2s per attempt

          // Re-check DB (webhook may have arrived)
          const refreshed = await prisma.eventTicketOrder.findUnique({
            where: { id: clientReference },
            include: { tickets: true },
          });
          if (refreshed?.paymentStatus === 'success' || (refreshed?.tickets?.length ?? 0) > 0) {
            paymentConfirmed = true;
            break;
          }

          // Try Hubtel status API
          try {
            const hubtelResult = await hubtelService.checkStatus(clientReference);
            if (hubtelResult.success) {
              paymentConfirmed = true;
              // Mark order as paid
              await prisma.eventTicketOrder.update({
                where: { id: clientReference },
                data: { paymentStatus: 'success' },
              });
            }
          } catch (err) {
            console.error(`[payment-callback] Hubtel status check attempt ${attempt + 1} failed:`, err instanceof Error ? err.message : err);
          }
        }
      }

      // Even if not confirmed yet, redirect to confirmation page — it has retry logic
      if (!paymentConfirmed) {
        console.warn('[payment-callback] Hubtel payment not confirmed after retries. DB status:', order.paymentStatus, '— redirecting to confirmation page for client-side retry');
      }

      // Only attempt ticket generation if payment is confirmed
      if (paymentConfirmed) {
        try {
          const attendeesFromDb = order.attendees as unknown as AttendeeInfo[] | null;
          if (attendeesFromDb && attendeesFromDb.length > 0) {
            await fulfillTicketOrder(clientReference, attendeesFromDb, baseUrl);
          } else {
            await prisma.eventTicketOrder.update({
              where: { id: clientReference },
              data: { paymentStatus: 'success' },
            });
          }
        } catch (err) {
          console.error('[payment-callback] Hubtel fulfillment error:', err);
        }
      }

      // Always redirect to confirmation page — it has client-side retry logic
      const slug = eventSlug || await getEventSlug(order.eventId);
      return NextResponse.redirect(
        `${baseUrl}/events/${slug}/ticket-confirmation?reference=${clientReference}&provider=hubtel`
      );
    }

    // ---- Paystack redirect ----
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) {
      return NextResponse.redirect(`${baseUrl}/events?error=missing_reference`);
    }

    // Verify with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      console.error('PAYSTACK_SECRET_KEY not configured');
      return NextResponse.redirect(`${baseUrl}/events?error=config_error`);
    }

    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${paystackSecretKey}` } }
    );
    const verifyData = await verifyResponse.json();

    if (!verifyData.status || verifyData.data.status !== 'success') {
      return NextResponse.redirect(`${baseUrl}/events?error=payment_failed`);
    }

    const metadata = verifyData.data.metadata;
    if (!metadata?.orderId) {
      return NextResponse.redirect(`${baseUrl}/events?error=invalid_metadata`);
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
      return NextResponse.redirect(`${baseUrl}/events?error=missing_attendees`);
    }

    const result = await fulfillTicketOrder(metadata.orderId, attendees, baseUrl);
    const slug = result.event?.slug || '';
    return NextResponse.redirect(
      `${baseUrl}/events/${slug}/ticket-confirmation?reference=${reference}`
    );
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(`${baseUrl}/events?error=processing_error`);
  }
}

// =============================================================================
// POST — Hubtel webhook (server-to-server notification)
// =============================================================================

export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sankofatribe.com';

  try {
    const body = await request.json();
    console.log('[events/payment-callback] Hubtel webhook:', JSON.stringify(body, null, 2));

    const parsed = hubtelService.parseCallback(body);
    if (!parsed.success || !parsed.clientReference) {
      return NextResponse.json({ success: false, message: 'Payment not successful or missing reference' });
    }

    const orderId = parsed.clientReference;
    const order = await prisma.eventTicketOrder.findUnique({
      where: { id: orderId },
      include: { tier: true, tickets: true },
    });

    if (!order) {
      console.error('[events/payment-callback] order not found:', orderId);
      return NextResponse.json({ success: false, message: 'Order not found' });
    }

    if (order.tickets.length > 0) {
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    // Attendees are stored in the DB at purchase time — read them
    const attendeesFromDb = order.attendees as unknown as AttendeeInfo[] | null;
    if (attendeesFromDb && attendeesFromDb.length > 0) {
      // We have attendees — generate tickets now
      await fulfillTicketOrder(orderId, attendeesFromDb, baseUrl);
      console.log('[events/payment-callback] Hubtel webhook: tickets generated for', orderId);
      return NextResponse.json({ success: true });
    }

    // Fallback: just mark payment successful, confirmation page will trigger ticket gen
    await prisma.eventTicketOrder.update({
      where: { id: orderId },
      data: { paymentStatus: 'success' },
    });

    console.log('[events/payment-callback] Hubtel payment confirmed, order updated:', orderId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[events/payment-callback] Hubtel webhook error:', error);
    return NextResponse.json({ success: false, message: 'Internal error' });
  }
}

// =============================================================================
// Helper: get event slug from event ID
// =============================================================================

async function getEventSlug(eventId: string): Promise<string> {
  try {
    const event = await serverClient.fetch(
      `*[_type == "event" && _id == $eventId][0] { "slug": slug.current }`,
      { eventId }
    );
    return event?.slug || '';
  } catch {
    return '';
  }
}
