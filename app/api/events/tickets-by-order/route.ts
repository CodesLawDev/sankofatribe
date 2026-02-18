import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/auth-utils';

const prisma = getPrisma();

/**
 * Simple ticket lookup by order reference.
 * No payment verification - just returns tickets that exist in the database.
 * Payment verification already happened in payment-callback route before redirect.
 */
export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference');

  if (!reference) {
    return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
  }

  try {
    // Find the order by ID (reference IS the order ID for Hubtel, or stored in metadata for Paystack)
    const order = await prisma.eventTicketOrder.findFirst({
      where: {
        OR: [
          { id: reference },
          { paymentReference: reference },
        ],
      },
      include: {
        tier: true,
        tickets: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.tickets.length === 0) {
      return NextResponse.json({ error: 'Tickets not yet created for this order' }, { status: 404 });
    }

    // Format tickets in the shape the confirmation page expects
    const tickets = order.tickets.map((ticket) => ({
      ticket: {
        ticketId: ticket.ticketId,
        eventId: ticket.eventId,
        attendeeName: ticket.attendeeName,
        attendeeEmail: ticket.attendeeEmail,
        attendeePhone: ticket.attendeePhone,
        tierName: order.tier.name,
        tierDescription: order.tier.description,
        qrCode: ticket.qrCode,
        status: ticket.status,
        usedAt: ticket.usedAt,
        createdAt: ticket.createdAt,
      },
      order: {
        orderId: order.id,
        buyerName: order.buyerName,
        buyerEmail: order.buyerEmail,
        totalAmount: order.totalAmount,
        currency: order.currency,
        paymentStatus: order.paymentStatus,
      },
    }));

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Error fetching tickets by order:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}
