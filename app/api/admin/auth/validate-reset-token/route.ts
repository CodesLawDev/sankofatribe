import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/sanity-server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/auth/validate-reset-token
 * Body: { token: string }
 * 
 * Validates if a reset token exists and hasn't expired.
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Token is required' }, { status: 400 })
    }

    // Find user with this token
    const user = await serverClient.fetch<any>(
      `*[_type == "user" && resetToken == $token][0]`,
      { token }
    )

    if (!user) {
      return NextResponse.json({ valid: false, error: 'Invalid token' }, { status: 404 })
    }

    // Check if token has expired
    if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Token has expired' }, { status: 400 })
    }

    return NextResponse.json({ valid: true })
  } catch (error: any) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { valid: false, error: 'Failed to validate token' },
      { status: 500 }
    )
  }
}
