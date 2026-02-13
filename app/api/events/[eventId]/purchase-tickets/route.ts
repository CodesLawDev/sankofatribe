import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/auth-utils';
import { serverClient } from '@/lib/sanity-server';
import { nanoid } from 'nanoid';
import { generateHubtelReference, initHubtelCheckout } from '@/lib/hubtel';

const prisma = getPrisma();

interface AttendeeInfo {
  name: string;
  email: string;
  phone: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;
    const body = await request.json();
    
    const {
      tierId,
      ticketCount,
      buyerEmail,
      buyerPhone,
      buyerName,
      attendees,
      totalAmount,
      currency = 'GHS',
      paymentProvider,
      tierPrice,
      tierQuantity,
    }: {
      tierId: string;
      ticketCount: number;
      buyerEmail: string;
      buyerPhone: string;
      buyerName: string;
      attendees: AttendeeInfo[];
      totalAmount: number;
      currency: string;
      paymentProvider?: string;
      tierPrice?: number;
      tierQuantity?: number;
    } = body;

    // Validate input
    if (!tierId || !ticketCount || !buyerEmail || !buyerName || !attendees || attendees.length !== ticketCount) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Check ticket availability
    let tier = await prisma.eventTicketTier.findFirst({
      where: {
        eventId,
        name: tierId,
      },
    });

    // If tier is not in DB, attempt to create it from provided payload values
    if (!tier) {
      if (typeof tierPrice === 'number' && typeof tierQuantity === 'number') {
        tier = await prisma.eventTicketTier.create({
          data: {
            eventId,
            name: tierId,
            price: tierPrice,
            quantity: tierQuantity,
            sold: 0,
          },
        });
      } else {
        return NextResponse.json(
          { error: 'Ticket tier not found and missing tier details' },
          { status: 404 }
        );
      }
    }

    const availableTickets = tier.quantity - tier.sold;
    if (availableTickets < ticketCount) {
      return NextResponse.json(
        { error: `Only ${availableTickets} tickets available` },
        { status: 400 }
      );
    }

    // Validate that we can generate unique ticket IDs before charging customer
    const eventAbbrev = await validateTicketIdGeneration(eventId);
    if (!eventAbbrev) {
      return NextResponse.json(
        { error: 'Unable to generate ticket IDs for this event' },
        { status: 400 }
      );
    }

    // Validate attendee email + phone uniqueness before payment
    const duplicateAttendees = [];
    for (const attendee of attendees) {
      const existingTicket = await prisma.eventTicket.findFirst({
        where: {
          eventId,
          attendeeEmail: attendee.email,
          attendeePhone: attendee.phone,
        },
      });
      
      if (existingTicket) {
        duplicateAttendees.push({
          name: attendee.name,
          email: attendee.email,
          phone: attendee.phone,
          message: `Already registered with ticket ID: ${existingTicket.ticketId}`,
        });
      }
    }

    if (duplicateAttendees.length > 0) {
      return NextResponse.json(
        { 
          error: 'Some attendees are already registered for this event',
          duplicates: duplicateAttendees,
        },
        { status: 409 }
      );
    }

    // Create order
    const orderId = `ORD-${nanoid(10)}`;
    const isFree = totalAmount === 0;
    const normalizedProvider = paymentProvider ? paymentProvider.toUpperCase() : '';

    if (!isFree && !normalizedProvider) {
      return NextResponse.json(
        { error: 'Payment provider is required for paid tickets' },
        { status: 400 }
      );
    }

    const order = await prisma.eventTicketOrder.create({
      data: {
        orderId: orderId,
        eventId,
        tierId: tier.id,
        buyerEmail,
        buyerPhone,
        buyerName,
        ticketCount,
        totalAmount,
        currency,
        paymentStatus: isFree ? 'success' : 'pending',
        paymentReference: isFree ? `FREE-${nanoid(10)}` : '',
        paymentMethod: normalizedProvider ? normalizedProvider.toLowerCase() : undefined,
        attendees: attendees as any,
      },
    });

    // For free tickets, generate tickets immediately
    if (isFree) {
      // Generate tickets with unique IDs
      const tickets = attendees.map((attendee, index) => {
        const ticketId = `EVT-${eventId.slice(0, 8)}-TK-${nanoid(6).toUpperCase()}`;
        return {
          ticketId,
          orderId: order.id,
          eventId,
          tierId: tier.id,
          attendeeName: attendee.name,
          attendeeEmail: attendee.email,
          attendeePhone: attendee.phone,
          status: 'AVAILABLE' as const,
        };
      });

      await prisma.eventTicket.createMany({
        data: tickets,
      });

      // Update sold count
      await prisma.eventTicketTier.update({
        where: { id: tier.id },
        data: { sold: { increment: ticketCount } },
      });

      return NextResponse.json({
        orderId: order.id,
        reference: order.paymentReference,
        isFree: true,
        message: 'Tickets reserved successfully',
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sankofatribe.com';

    if (normalizedProvider === 'PAYSTACK') {
      // For paid tickets, initiate Paystack payment
      const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
      if (!paystackSecretKey) {
        return NextResponse.json(
          { error: 'Payment configuration error' },
          { status: 500 }
        );
      }

      const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: buyerEmail,
          amount: Math.round(totalAmount * 100), // Paystack expects amount in kobo (pesewas for GHS)
          currency,
          reference: order.id,
          // Use dedicated callback route that handles verification and redirects
          callback_url: `${baseUrl}/api/events/payment-callback?provider=PAYSTACK`,
          metadata: {
            orderId: order.id,
            eventId,
            tierId: tier.id,
            ticketCount,
            buyerName,
            buyerPhone,
            attendees: JSON.stringify(attendees),
          },
        }),
      });

      const paystackData = await paystackResponse.json();

      if (!paystackData.status) {
        return NextResponse.json(
          { error: 'Failed to initiate payment' },
          { status: 500 }
        );
      }

      // Update order with payment reference
      await prisma.eventTicketOrder.update({
        where: { id: order.id },
        data: { paymentReference: paystackData.data.reference },
      });

      return NextResponse.json({
        orderId: order.id,
        paymentUrl: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
      });
    }

    if (normalizedProvider === 'HUBTEL') {
      const hubtelReference = order.id || generateHubtelReference('EVT');
      const returnUrl = `${baseUrl}/api/events/payment-callback?provider=HUBTEL&reference=${encodeURIComponent(hubtelReference)}`;
      const callbackUrl = `${baseUrl}/api/webhooks/hubtel/payments`;

      const hubtelResult = await initHubtelCheckout({
        amountGhs: totalAmount,
        clientReference: hubtelReference,
        description: `Tickets for ${eventId}`,
        returnUrl,
        callbackUrl,
        cancellationUrl: `${baseUrl}/events/${eventId}?payment=cancelled`,
        customerName: buyerName,
        customerEmail: buyerEmail,
        customerPhone: buyerPhone,
      });

      await prisma.eventTicketOrder.update({
        where: { id: order.id },
        data: { paymentReference: hubtelReference },
      });

      return NextResponse.json({
        orderId: order.id,
        paymentUrl: hubtelResult.checkoutUrl,
        reference: hubtelResult.clientReference,
      });
    }

    return NextResponse.json(
      { error: `Unsupported payment provider: ${normalizedProvider}` },
      { status: 400 }
    );
  } catch (error) {
    console.error('Ticket purchase error:', error);
    return NextResponse.json(
      { error: 'Failed to process ticket purchase' },
      { status: 500 }
    );
  }
}

/**
 * Validate that we can generate unique ticket IDs for the event
 * Returns the event abbreviation if valid, null if invalid
 */
async function validateTicketIdGeneration(eventId: string): Promise<string | null> {
  try {
    const eventQuery = `*[_type == "event" && _id == $eventId][0] { title }`;
    const event = await serverClient.fetch<{ title: string }>(eventQuery, { eventId });
    
    if (!event || !event.title) {
      return null;
    }

    const eventAbbrev = event.title
      .split(' ')
      .filter((word: string) => word.length > 2)
      .slice(0, 3)
      .map((word: string) => word[0].toUpperCase())
      .join('');
    
    if (!eventAbbrev || eventAbbrev.length === 0) {
      return null;
    }

    return eventAbbrev;
  } catch (error) {
    console.error('Failed to validate ticket ID generation:', error);
    return null;
  }
}
