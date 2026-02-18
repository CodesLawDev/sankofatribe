import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/auth-utils'
import { v4 as uuidv4 } from 'uuid'

const prisma = getPrisma()

export const dynamic = 'force-dynamic'

/**
 * Track page views for analytics
 * POST /api/analytics/track
 * Body: { path: string, userId?: string, referrer?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path, userId, referrer } = body

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 })
    }

    // Get session ID from cookie or create new one
    let sessionId = request.cookies.get('analytics_session')?.value
    if (!sessionId) {
      sessionId = uuidv4()
    }

    // Extract request metadata
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
    const userAgent = request.headers.get('user-agent') || undefined
    const country = request.headers.get('x-vercel-ip-country') || undefined

    // Detect device type from user agent
    let device = 'desktop'
    if (userAgent) {
      if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) {
        device = /ipad|tablet/i.test(userAgent) ? 'tablet' : 'mobile'
      }
    }

    // Save page view to database
    await prisma.pageView.create({
      data: {
        path,
        userId: userId || undefined,
        sessionId,
        ipAddress,
        userAgent,
        referrer: referrer || undefined,
        country,
        device,
      },
    })

    // Set session cookie (7 days)
    const response = NextResponse.json({ success: true })
    response.cookies.set('analytics_session', sessionId, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    )
  }
}
