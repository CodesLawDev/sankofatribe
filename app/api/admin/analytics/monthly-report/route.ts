import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/lib/auth-utils'
import { cookies } from 'next/headers'
import { sendBulkSMS, formatMonthlyReport, getAdminPhoneNumbers } from '@/lib/sms-service'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

/**
 * Generate and send monthly analytics report via SMS
 * POST /api/admin/analytics/monthly-report
 * Body: { month?: number, year?: number } (defaults to previous month)
 * Requires: Admin authentication
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json().catch(() => ({}))
    
    // Default to previous month
    const now = new Date()
    const defaultMonth = now.getMonth() === 0 ? 12 : now.getMonth()
    const defaultYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    
    const month = body.month || defaultMonth
    const year = body.year || defaultYear

    // Check if report already sent
    const existingReport = await prisma.monthlyReport.findUnique({
      where: {
        month_year: {
          month,
          year,
        },
      },
    })

    if (existingReport && existingReport.smsSent) {
      return NextResponse.json({
        message: 'Report already sent for this month',
        report: existingReport,
      })
    }

    // Calculate date range
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    // Fetch analytics data
    const totalOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

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

    const totalPageViews = await prisma.pageView.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

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

    const newCustomers = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        registeredAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Format month name
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const monthName = `${monthNames[month - 1]} ${year}`

    // Create or update monthly report
    const report = await prisma.monthlyReport.upsert({
      where: {
        month_year: {
          month,
          year,
        },
      },
      create: {
        month,
        year,
        totalOrders,
        totalRevenue,
        totalPageViews,
        uniqueVisitors,
        newCustomers,
        successfulPayments,
        failedPayments,
        paymentRevenue: totalRevenue,
      },
      update: {
        totalOrders,
        totalRevenue,
        totalPageViews,
        uniqueVisitors,
        newCustomers,
        successfulPayments,
        failedPayments,
        paymentRevenue: totalRevenue,
      },
    })

    // Get admin phone numbers
    const adminPhones = await getAdminPhoneNumbers()

    if (adminPhones.length === 0) {
      return NextResponse.json({
        message: 'Report generated but no admin phone numbers configured',
        report,
      })
    }

    // Format SMS message
    const message = formatMonthlyReport({
      month: monthName,
      totalOrders,
      totalRevenue,
      totalPageViews,
      uniqueVisitors,
      newCustomers,
      successfulPayments,
      failedPayments,
    })

    // Send SMS to all admins
    const smsResult = await sendBulkSMS(adminPhones, message)

    // Update report with SMS status
    await prisma.monthlyReport.update({
      where: {
        month_year: {
          month,
          year,
        },
      },
      data: {
        smsSent: smsResult.success > 0,
        smsRecipients: adminPhones,
        smsSentAt: new Date(),
      },
    })

    return NextResponse.json({
      message: `Monthly report sent successfully to ${smsResult.success} recipient(s)`,
      report: {
        month: monthName,
        totalOrders,
        totalRevenue,
        totalPageViews,
        uniqueVisitors,
        newCustomers,
        successfulPayments,
        failedPayments,
      },
      sms: {
        sent: smsResult.success,
        failed: smsResult.failed,
        recipients: adminPhones,
      },
    })
  } catch (error: any) {
    console.error('Monthly report error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate monthly report' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Get monthly report status
 * GET /api/admin/analytics/monthly-report?month=1&year=2026
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

    const { searchParams } = new URL(request.url)
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))

    const report = await prisma.monthlyReport.findUnique({
      where: {
        month_year: {
          month,
          year,
        },
      },
    })

    if (!report) {
      return NextResponse.json({
        message: 'No report found for this period',
        month,
        year,
      })
    }

    return NextResponse.json(report)
  } catch (error: any) {
    console.error('Get monthly report error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get monthly report' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
