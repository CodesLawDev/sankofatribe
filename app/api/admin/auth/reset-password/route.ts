import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/sanity-server'
import { hashPassword } from '@/lib/passwordUtils'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/auth/reset-password
 * Body: { token: string, password: string }
 * 
 * Resets the user's password using a valid reset token.
 */
export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Find user with this token
    const user = await serverClient.fetch<any>(
      `*[_type == "user" && resetToken == $token][0]`,
      { token }
    )

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 })
    }

    // Check if token has expired
    if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
      return NextResponse.json({ error: 'Token has expired' }, { status: 400 })
    }

    // Hash the new password
    const { hash } = hashPassword(password)

    // Update user: set new password hash and clear reset token
    await serverClient
      .patch(user._id)
      .set({ passwordHash: hash })
      .unset(['resetToken', 'resetTokenExpiry', 'temporaryPassword'])
      .commit()

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    )
  }
}
