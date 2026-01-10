import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth-utils'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

/**
 * Get comprehensive analytics data
 * GET /api/admin/analytics?period=month&month=1&year=2026
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
    if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // month, year, all-time
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))

    // Calculate date range
    let startDate: Date
    let endDate: Date

    if (period === 'month') {
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0, 23, 59, 59)
    } else if (period === 'year') {
      startDate = new Date(year, 0, 1)
      endDate = new Date(year, 11, 31, 23, 59, 59)
    } else {
      // All time
      startDate = new Date(2000, 0, 1)
      endDate = new Date()
    }

    // Get total orders in period
    const totalOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Get total revenue in period
    const revenueResult = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          notIn: ['CANCELLED', 'REFUNDED'],
        },
      },
      _sum: {
        total: true,
      },
    })

    const totalRevenue = revenueResult._sum.total || 0

    // Get successful and failed payments
    const successfulPayments = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        paymentStatus: 'success',
      },
    })

    const failedPayments = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        paymentStatus: 'failed',
      },
    })

    // Get page views in period
    const totalPageViews = await prisma.pageView.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Get unique visitors (distinct sessionIds)
    const uniqueVisitorsResult = await prisma.pageView.groupBy({
      by: ['sessionId'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    const uniqueVisitors = uniqueVisitorsResult.length

    // Get new customers in period
    const newCustomers = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        registeredAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Get orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    })

    const statusBreakdown = ordersByStatus.reduce((acc, item) => {
      acc[item.status.toLowerCase()] = item._count
      return acc
    }, {} as Record<string, number>)

    // Get daily page views for chart
    const dailyPageViews = await prisma.$queryRaw<Array<{ date: string; views: number }>>`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*)::int as views
      FROM "PageView"
      WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `

    // Get daily orders for chart
    const dailyOrders = await prisma.$queryRaw<Array<{ date: string; orders: number; revenue: number }>>`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*)::int as orders,
        SUM(total)::float as revenue
      FROM "Order"
      WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `

    // Get device breakdown
    const deviceBreakdown = await prisma.pageView.groupBy({
      by: ['device'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    })

    const devices = deviceBreakdown.reduce((acc, item) => {
      if (item.device) {
        acc[item.device] = item._count
      }
      return acc
    }, {} as Record<string, number>)

    // Get top pages
    const topPages = await prisma.pageView.groupBy({
      by: ['path'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
      orderBy: {
        _count: {
          path: 'desc',
        },
      },
      take: 10,
    })

    const analytics = {
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      
      // Main metrics
      totalOrders,
      totalRevenue,
      totalPageViews,
      uniqueVisitors,
      newCustomers,
      
      // Payment metrics
      successfulPayments,
      failedPayments,
      paymentSuccessRate: totalOrders > 0 ? (successfulPayments / totalOrders * 100).toFixed(2) : 0,
      
      // Order metrics
      statusBreakdown,
      averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0,
      
      // Traffic metrics
      averagePageViewsPerVisitor: uniqueVisitors > 0 ? (totalPageViews / uniqueVisitors).toFixed(2) : 0,
      devices,
      
      // Charts data
      dailyPageViews,
      dailyOrders,
      topPages: topPages.map(p => ({ path: p.path, views: p._count })),
    }

    return NextResponse.json(analytics)
  } catch (error: any) {
    console.error('Get analytics error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get analytics' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
