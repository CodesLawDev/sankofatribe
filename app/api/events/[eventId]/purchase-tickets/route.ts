import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/auth-utils';
import { serverClient } from '@/lib/sanity-server';
import { nanoid } from 'nanoid';

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

    // For paid tickets, initiate Paystack payment (using CodeTickets credentials)
    const paystackSecretKey = process.env.CODETICKETS_PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      return NextResponse.json(
        { error: 'CodeTickets payment configuration error' },
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
        // Use site URL env; pass reference back via query for confirmation page
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/events/${eventId}/ticket-confirmation`,
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
