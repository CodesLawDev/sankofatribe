/**
 * SMS Service using existing BMS provider
 * Handles sending SMS notifications for analytics and reports
 */

interface SMSResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send SMS using existing BMS API endpoint
 */
export async function sendSMS(
  to: string,
  message: string
): Promise<SMSResult> {
  try {
    // Call existing SMS endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'generic',
        recipients: [to],
        data: {
          message,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('BMS SMS API error:', error)
      return {
        success: false,
        error: error.error || 'Failed to send SMS',
      }
    }

    const data = await response.json()
    return {
      success: data.success || false,
      messageId: data.data?.messageId,
    }
  } catch (error: any) {
    console.error('SMS service error:', error)
    return {
      success: false,
      error: error.message || 'Failed to send SMS',
    }
  }
}

/**
 * Send SMS to multiple recipients
 */
export async function sendBulkSMS(
  recipients: string[],
  message: string
): Promise<{ success: number; failed: number; results: SMSResult[] }> {
  try {
    // Use existing SMS endpoint that supports bulk sending
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'generic',
        recipients,
        data: {
          message,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('BMS bulk SMS error:', error)
      return {
        success: 0,
        failed: recipients.length,
        results: recipients.map(() => ({
          success: false,
          error: error.error || 'Failed to send SMS',
        })),
      }
    }

    const data = await response.json()
    if (data.success) {
      return {
        success: recipients.length,
        failed: 0,
        results: recipients.map(() => ({
          success: true,
          messageId: data.data?.messageId,
        })),
      }
    } else {
      return {
        success: 0,
        failed: recipients.length,
        results: recipients.map(() => ({
          success: false,
          error: data.error || 'Failed to send SMS',
        })),
      }
    }
  } catch (error: any) {
    console.error('Bulk SMS service error:', error)
    return {
      success: 0,
      failed: recipients.length,
      results: recipients.map(() => ({
        success: false,
        error: error.message || 'Failed to send SMS',
      })),
    }
  }
}

/**
 * Format monthly analytics report for SMS
 */
export function formatMonthlyReport(data: {
  month: string
  totalOrders: number
  totalRevenue: number
  totalPageViews: number
  uniqueVisitors: number
  newCustomers: number
  successfulPayments: number
  failedPayments: number
}): string {
  const { month, totalOrders, totalRevenue, totalPageViews, uniqueVisitors, newCustomers, successfulPayments, failedPayments } = data

  return `🎉 Sankofa Tribe - ${month} Report

📦 Orders: ${totalOrders}
💰 Revenue: GH₵${totalRevenue.toLocaleString()}
💳 Payments: ${successfulPayments} successful, ${failedPayments} failed

👥 Visitors: ${totalPageViews.toLocaleString()} views (${uniqueVisitors.toLocaleString()} unique)
🆕 New Customers: ${newCustomers}

Keep up the great work! 🚀`
}

/**
 * Get admin phone numbers from Sanity settings
 */
export async function getAdminPhoneNumbers(): Promise<string[]> {
  try {
    const { serverClient } = await import('@/lib/sanity-server')
    
    const settings = await serverClient.fetch<{ adminPhone?: string }>(
      `*[_type == "siteSettings"][0]{adminPhone}`
    )
    
    if (settings?.adminPhone) {
      // Support multiple phone numbers separated by comma
      return settings.adminPhone
        .split(',')
        .map((phone) => phone.trim())
        .filter(Boolean)
    }
  } catch (error) {
    console.error('Failed to fetch admin phone from Sanity settings:', error)
  }

  console.warn('No admin phone configured in Sanity settings')
  return []
}
