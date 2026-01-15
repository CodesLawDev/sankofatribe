import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getPrisma } from '@/lib/auth-utils'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

/**
 * Admin endpoint to get dashboard statistics
 * GET /api/admin/stats
 * Requires: Admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Only admins can access stats
    if (payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const prisma = getPrisma()

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Fetch all orders with their details
    const allOrders = await prisma.order.findMany({
      select: {
        id: true,
        total: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
    })

    // Calculate statistics
    const stats = {
      totalOrders: allOrders.length,
      totalRevenue: allOrders.reduce((sum, order) => sum + (order.total || 0), 0),
      pendingOrders: allOrders.filter(o => o.status === 'PENDING').length,
      processingOrders: allOrders.filter(o => o.status === 'PROCESSING').length,
      shippedOrders: allOrders.filter(o => o.status === 'SHIPPED').length,
      deliveredOrders: allOrders.filter(o => o.status === 'DELIVERED').length,
      cancelledOrders: allOrders.filter(o => o.status === 'CANCELLED').length,
      todayOrders: allOrders.filter(o => new Date(o.createdAt) >= today && new Date(o.createdAt) < tomorrow).length,
      todayRevenue: allOrders
        .filter(o => new Date(o.createdAt) >= today && new Date(o.createdAt) < tomorrow)
        .reduce((sum, order) => sum + (order.total || 0), 0),
      paidOrders: allOrders.filter(o => o.paymentStatus === 'paid' || o.paymentStatus === 'success').length,
      unpaidOrders: allOrders.filter(o => o.paymentStatus === 'pending' || o.paymentStatus === 'failed').length,
    }

    return NextResponse.json(stats)
  } catch (error: any) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get stats' },
      { status: 500 }
    )
  }
}
