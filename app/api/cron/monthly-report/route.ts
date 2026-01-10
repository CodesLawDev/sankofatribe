import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Cron Endpoint - Runs monthly to send analytics SMS
 * Intended to be triggered by GitHub Actions (or any scheduler)
 * Schedule is defined in .github/workflows/monthly-report.yml
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Running monthly analytics report cron job...')

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    request.headers.get('host') ? 
                    `https://${request.headers.get('host')}` : 
                    'http://localhost:3000'

    // Call the monthly report API internally
    const reportUrl = `${baseUrl}/api/admin/analytics/monthly-report`
    
    const response = await fetch(reportUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Failed to generate monthly report:', error)
      return NextResponse.json(
        { 
          error: 'Failed to generate report',
          details: error 
        },
        { status: 500 }
      )
    }

    const data = await response.json()
    console.log('Monthly report sent successfully:', data)

    return NextResponse.json({
      success: true,
      message: 'Monthly report generated and sent',
      data,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { 
        error: 'Cron job failed',
        message: error.message 
      },
      { status: 500 }
    )
  }
}
