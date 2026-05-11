import { NextRequest, NextResponse } from 'next/server'
import { validateResetToken } from '@/lib/password-reset'

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

    const result = await validateResetToken(token)
    if (!result.valid) {
      return NextResponse.json(result, { status: 400 })
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
