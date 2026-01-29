import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/auth-utils';

const prisma = getPrisma();

/**
 * POST /api/admin/tickets/orders/[orderId]/fail
 * Mark a pending order as failed/cancelled
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    // Get order
    const order = await prisma.eventTicketOrder.findUnique({
      where: { id: orderId },
      include: { tickets: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.paymentStatus === 'success') {
      return NextResponse.json({ 
        error: 'Cannot fail a successful order. Tickets have already been issued.',
        tickets: order.tickets.length 
      }, { status: 400 });
    }

    if (order.paymentStatus === 'failed') {
      return NextResponse.json({ 
        error: 'Order is already marked as failed' 
      }, { status: 400 });
    }

    // Update order status to failed
    await prisma.eventTicketOrder.update({
      where: { id: order.id },
      data: { 
        paymentStatus: 'failed',
        status: 'cancelled',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Order marked as failed',
      orderId: order.orderId,
      reason: reason || 'Manually marked as failed by admin',
    });

  } catch (error) {
    console.error('Fail order error:', error);
    return NextResponse.json(
      { error: 'Failed to update order', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
