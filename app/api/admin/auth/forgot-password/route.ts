import { NextRequest, NextResponse } from 'next/server'
import { requestPasswordReset } from '@/lib/password-reset'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/auth/forgot-password
 * Body: { email?: string, phone?: string }
 * 
 * Generates a secure reset token, stores it with expiry in the user document,
 * and sends an SMS with the reset link to the user's phone.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, phone } = await request.json()

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      )
    }

    await requestPasswordReset({ email, phone })

    return NextResponse.json({
      success: true,
      message: 'If an account exists, a password reset link has been sent.',
    })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    )
  }
}
