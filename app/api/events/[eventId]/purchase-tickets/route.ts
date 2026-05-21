import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/auth-utils';
import { serverClient } from '@/lib/sanity-server';
import { nanoid } from 'nanoid';
import paymentService, { generateReference } from '@/lib/payment';
import hubtelService from '@/lib/hubtel';

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
      provider = 'hubtel',
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
      provider?: 'hubtel';
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
        attendees: attendees as any, // Store attendees at purchase time for both providers
        paymentStatus: isFree ? 'success' : 'pending',
        paymentReference: isFree ? `FREE-${nanoid(10)}` : '',
        paymentMethod: provider, // Store the actual provider (paystack or hubtel)
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

    // Initiate payment via Hubtel
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    if (!hubtelService.isConfigured) {
      return NextResponse.json(
        { error: 'Hubtel payment is not configured' },
        { status: 500 }
      );
    }

    const eventQuery = `*[_type == "event" && _id == $eventId][0] { title, "slug": slug.current }`;
    const event = await serverClient.fetch(eventQuery, { eventId });
    const eventTitle = event?.title || 'Event';

    const hubtelResult = await hubtelService.initializeCheckout({
      amount: totalAmount,
      description: `SankofaTribe Tickets: ${ticketCount}x ${tierId} for ${eventTitle}`,
      clientReference: order.id,
      returnUrl: `${siteUrl}/api/events/payment-callback?provider=hubtel&clientReference=${order.id}&eventSlug=${event?.slug || ''}`,
      callbackUrl: `${siteUrl}/api/events/payment-callback`,
    });

    return NextResponse.json({
      orderId: order.id,
      paymentUrl: hubtelResult.checkoutUrl,
      reference: order.id,
      provider: 'hubtel',
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
