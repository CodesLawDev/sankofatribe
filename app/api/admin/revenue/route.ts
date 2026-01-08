import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/sanity-server'
import { getAdminSession } from '@/lib/adminAuth'
import { hasPermission } from '@/lib/adminTypes'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const session = getAdminSession()
    if (!session || !hasPermission(session.user, 'view_analytics')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const period = request.nextUrl.searchParams.get('period') || 'all' // all, today, week, month

    // Get current date for period filtering
    const now = new Date()
    let dateFilter = ''

    if (period === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      dateFilter = ` && orderDate >= "${startOfDay.toISOString()}" && orderDate < "${endOfDay.toISOString()}"`
    } else if (period === 'week') {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      dateFilter = ` && orderDate >= "${startOfWeek.toISOString()}"`
    } else if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      dateFilter = ` && orderDate >= "${startOfMonth.toISOString()}"`
    }

    // Fetch all relevant orders for revenue calculation
    const orders = await serverClient.fetch(
      `*[_type == "order" && status != "cancelled" && status != "refunded"${dateFilter}]`
    )

    // Calculate metrics
    const totalRevenue = orders.reduce((sum: number, order: any) => {
      return sum + (order.total || 0)
    }, 0)

    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Revenue by status (including cancelled/refunded for analysis)
    const allOrders = await serverClient.fetch(
      `*[_type == "order"${dateFilter}] { _id, status, total, paymentStatus }`
    )

    const revenueByStatus = {
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
      pending_payment: 0,
    }

    const ordersByPaymentStatus = {
      paid: 0,
      unpaid: 0,
    }

    allOrders.forEach((order: any) => {
      const amount = order.total || 0
      if (revenueByStatus.hasOwnProperty(order.status)) {
        revenueByStatus[order.status as keyof typeof revenueByStatus] += amount
      }

      if (order.paymentStatus === 'paid') {
        ordersByPaymentStatus.paid++
      } else {
        ordersByPaymentStatus.unpaid++
      }
    })

    // Revenue by payment method (if tracked in metadata)
    const revenueByPaymentMethod: { [key: string]: number } = {}
    allOrders.forEach((order: any) => {
      const method = order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'
      revenueByPaymentMethod[method] = (revenueByPaymentMethod[method] || 0) + (order.total || 0)
    })

    // Daily revenue trend for last 30 days
    const dailyRevenue: { [key: string]: number } = {}
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dailyRevenue[dateStr] = 0
    }

    const recentOrders = await serverClient.fetch(
      `*[_type == "order" && status != "cancelled" && status != "refunded" && orderDate >= "${new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()}"]`
    )

    recentOrders.forEach((order: any) => {
      const dateStr = new Date(order.orderDate).toISOString().split('T')[0]
      if (dailyRevenue.hasOwnProperty(dateStr)) {
        dailyRevenue[dateStr] += order.total || 0
      }
    })

    return NextResponse.json(
      {
        success: true,
        revenue: {
          total: totalRevenue,
          averageOrderValue,
          totalOrders,
          byStatus: revenueByStatus,
          byPaymentStatus: ordersByPaymentStatus,
          byPaymentMethod: revenueByPaymentMethod,
          dailyTrend: dailyRevenue,
        },
        period,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error: any) {
    console.error('Revenue API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch revenue data' },
      { status: 500 }
    )
  }
}
