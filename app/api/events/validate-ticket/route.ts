import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, eventId } = body;

    if (!ticketId || !eventId) {
      return NextResponse.json(
        { error: 'Ticket ID and Event ID are required' },
        { status: 400 }
      );
    }

    // Find the ticket
    const ticket = await prisma.eventTicket.findUnique({
      where: { ticketId },
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
        { 
          valid: false,
          error: 'Ticket not found',
          message: 'This ticket does not exist in our system'
        },
        { status: 404 }
      );
    }

    // Verify ticket belongs to this event
    if (ticket.eventId !== eventId) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Invalid event',
          message: 'This ticket is not valid for this event'
        },
        { status: 400 }
      );
    }

    // Check if ticket was already used
    if (ticket.status === 'USED') {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Ticket already used',
          message: `This ticket was already scanned at ${ticket.usedAt?.toLocaleString()}`,
          usedAt: ticket.usedAt,
        },
        { status: 400 }
      );
    }

    // Check if ticket is cancelled
    if (ticket.status === 'CANCELLED') {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Ticket cancelled',
          message: 'This ticket has been cancelled and is no longer valid'
        },
        { status: 400 }
      );
    }

    // Check payment status
    if (ticket.order.paymentStatus !== 'success') {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Payment not completed',
          message: 'Payment for this ticket was not completed'
        },
        { status: 400 }
      );
    }

    // Mark ticket as used
    const updatedTicket = await prisma.eventTicket.update({
      where: { ticketId },
      data: {
        status: 'USED',
        usedAt: new Date(),
      },
    });

    return NextResponse.json({
      valid: true,
      message: 'Ticket validated successfully',
      ticket: {
        ticketId: updatedTicket.ticketId,
        attendeeName: updatedTicket.attendeeName,
        attendeeEmail: updatedTicket.attendeeEmail,
        tierName: ticket.order.tier.name,
        usedAt: updatedTicket.usedAt,
      },
    });
  } catch (error) {
    console.error('Ticket validation error:', error);
    return NextResponse.json(
      { 
        valid: false,
        error: 'Validation failed',
        message: 'An error occurred while validating the ticket'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check ticket status without marking as used
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ticketId = searchParams.get('ticketId');
    const eventId = searchParams.get('eventId');

    if (!ticketId || !eventId) {
      return NextResponse.json(
        { error: 'Ticket ID and Event ID are required' },
        { status: 400 }
      );
    }

    const ticket = await prisma.eventTicket.findUnique({
      where: { ticketId },
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

    if (ticket.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Ticket not valid for this event' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ticketId: ticket.ticketId,
      attendeeName: ticket.attendeeName,
      attendeeEmail: ticket.attendeeEmail,
      status: ticket.status,
      usedAt: ticket.usedAt,
      tierName: ticket.order.tier.name,
      paymentStatus: ticket.order.paymentStatus,
    });
  } catch (error) {
    console.error('Ticket lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup ticket' },
      { status: 500 }
    );
  }
}

// PATCH endpoint to revert a ticket back to AVAILABLE
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, eventId } = body;

    if (!ticketId || !eventId) {
      return NextResponse.json(
        { error: 'Ticket ID and Event ID are required' },
        { status: 400 }
      );
    }

    const ticket = await prisma.eventTicket.findUnique({ where: { ticketId } });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    if (ticket.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Ticket not valid for this event' },
        { status: 400 }
      );
    }

    if (ticket.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cancelled tickets cannot be reverted' },
        { status: 400 }
      );
    }

    const updated = await prisma.eventTicket.update({
      where: { ticketId },
      data: {
        status: 'AVAILABLE',
        usedAt: null,
      },
    });

    return NextResponse.json({
      ticketId: updated.ticketId,
      status: updated.status,
      usedAt: updated.usedAt,
    });
  } catch (error) {
    console.error('Ticket revert error:', error);
    return NextResponse.json(
      { error: 'Failed to revert ticket' },
      { status: 500 }
    );
  }
}
