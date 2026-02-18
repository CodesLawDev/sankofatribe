import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/auth-utils';

const prisma = getPrisma();

export async function GET(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  try {
    const { ticketId } = params;
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json'; // json, image, wallet

    // Find the ticket - case insensitive partial match on multiple fields
    const ticket = await prisma.eventTicket.findFirst({
      where: {
        OR: [
          { ticketId: { contains: ticketId, mode: 'insensitive' } },
          { attendeeName: { contains: ticketId, mode: 'insensitive' } },
          { attendeeEmail: { contains: ticketId, mode: 'insensitive' } },
          { attendeePhone: { contains: ticketId, mode: 'insensitive' } },
          { order: { buyerName: { contains: ticketId, mode: 'insensitive' } } },
          { order: { buyerEmail: { contains: ticketId, mode: 'insensitive' } } },
        ],
      },
      include: {
        order: {
          include: {
            tier: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Check payment status
    if (ticket.order.paymentStatus !== 'success') {
      return NextResponse.json(
        { error: 'Payment not completed for this ticket' },
        { status: 400 }
      );
    }

    // Return different formats based on request
    if (format === 'image') {
      // Redirect to ticket image generation endpoint
      return NextResponse.redirect(
        new URL(`/api/tickets/${ticketId}/image`, request.url),
        { status: 307 }
      );
    }

    // Return JSON ticket data by default
    return NextResponse.json({
      ticket: {
        ticketId: ticket.ticketId,
        eventId: ticket.eventId,
        attendeeName: ticket.attendeeName,
        attendeeEmail: ticket.attendeeEmail,
        attendeePhone: ticket.attendeePhone,
        tierName: ticket.order.tier.name,
        tierDescription: ticket.order.tier.description,
        status: ticket.status,
        qrCode: ticket.qrCode,
        usedAt: ticket.usedAt,
        createdAt: ticket.createdAt,
      },
      order: {
        orderId: ticket.order.id,
        buyerName: ticket.order.buyerName,
        buyerEmail: ticket.order.buyerEmail,
        totalAmount: ticket.order.totalAmount,
        currency: ticket.order.currency,
        paymentStatus: ticket.order.paymentStatus,
      },
    });
  } catch (error) {
    console.error('Ticket download error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve ticket' },
      { status: 500 }
    );
  }
}
