import { NextRequest, NextResponse } from 'next/server'
import { requestPasswordReset } from '@/lib/password-reset'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { email, phone } = await request.json()

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      )
    }

    await requestPasswordReset({ email, phone, role: 'CUSTOMER' })

    return NextResponse.json({
      success: true,
      message: 'If an account exists, a password reset link has been sent.',
    })
  } catch (error: any) {
    console.error('Customer forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    )
  }
}
