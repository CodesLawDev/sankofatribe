import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth-utils'
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

    // Get all orders from database
    // For now, return mock data since orders table may not be fully set up
    const stats = {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      todayOrders: 0,
      todayRevenue: 0,
      paidOrders: 0,
      unpaidOrders: 0,
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
