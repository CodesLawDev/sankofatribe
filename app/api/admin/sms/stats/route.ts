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

    const period = request.nextUrl.searchParams.get('period') || 'month' // today, week, month, all
    const now = new Date()
    let dateFilter = ''

    if (period === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      dateFilter = ` && sentAt >= "${startOfDay.toISOString()}"`
    } else if (period === 'week') {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      dateFilter = ` && sentAt >= "${startOfWeek.toISOString()}"`
    } else if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      dateFilter = ` && sentAt >= "${startOfMonth.toISOString()}"`
    }

    // Fetch SMS logs
    const smsLogs = await serverClient.fetch(
      `*[_type == "smsLog"${dateFilter}] | order(sentAt desc) {
        _id,
        messageId,
        phoneNumbers,
        message,
        sentBy,
        sentAt,
        orderId,
        status,
        failureReason
      }`
    )

    // Calculate statistics
    const totalSMSSent = smsLogs.length
    const totalRecipients = smsLogs.reduce((sum: number, log: any) => {
      return sum + (Array.isArray(log.phoneNumbers) ? log.phoneNumbers.length : 1)
    }, 0)

    const statusBreakdown = {
      sent: 0,
      failed: 0,
      pending: 0,
    }

    const failureReasons: { [key: string]: number } = {}

    smsLogs.forEach((log: any) => {
      if (log.status === 'sent') statusBreakdown.sent++
      else if (log.status === 'failed') {
        statusBreakdown.failed++
        const reason = log.failureReason || 'Unknown'
        failureReasons[reason] = (failureReasons[reason] || 0) + 1
      } else if (log.status === 'pending') {
        statusBreakdown.pending++
      }
    })

    // SMS sent by user
    const smsByUser: { [key: string]: number } = {}
    const adminUsers = await serverClient.fetch(
      `*[_type == "adminUser"] { _id, firstName, lastName }`
    )

    const adminMap: { [key: string]: string } = {}
    adminUsers.forEach((user: any) => {
      adminMap[user._id] = `${user.firstName} ${user.lastName}`
    })

    smsLogs.forEach((log: any) => {
      const userName = adminMap[log.sentBy] || 'Unknown'
      smsByUser[userName] = (smsByUser[userName] || 0) + 1
    })

    // Daily SMS trend
    const dailySMS: { [key: string]: number } = {}
    const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dailySMS[dateStr] = 0
    }

    const recentLogs = await serverClient.fetch(
      `*[_type == "smsLog" && sentAt >= "${startDate.toISOString()}"]`
    )

    recentLogs.forEach((log: any) => {
      const dateStr = new Date(log.sentAt).toISOString().split('T')[0]
      if (dailySMS.hasOwnProperty(dateStr)) {
        dailySMS[dateStr]++
      }
    })

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalSMSSent,
          totalRecipients,
          averageRecipientsPerSMS: totalSMSSent > 0 ? totalRecipients / totalSMSSent : 0,
          statusBreakdown,
          failureReasons,
          smsByUser,
          dailyTrend: dailySMS,
        },
        period,
        recentSMS: smsLogs.slice(0, 10),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error: any) {
    console.error('SMS stats error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch SMS statistics' },
      { status: 500 }
    )
  }
}
