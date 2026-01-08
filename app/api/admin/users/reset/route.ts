import { client } from '@/lib/sanity'
import { getAdminSession } from '@/lib/adminAuth'
import { hasPermission } from '@/lib/adminTypes'
import { hashPassword } from '@/lib/passwordUtils'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function generateTempPassword(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase() + 
         Math.random().toString(36).slice(2, 4).toUpperCase()
}

export async function POST(request: Request) {
  try {
    const session = getAdminSession()
    if (!session || !hasPermission(session.user, 'manage_users')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, useTemporaryPassword, newPassword } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user to verify they exist
    const user = await client.getDocument(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Determine password to set
    let tempPassword: string | null = null
    let passwordToHash: string

    if (typeof newPassword === 'string' && newPassword.trim().length >= 6) {
      // Use provided new password
      passwordToHash = newPassword.trim()
    } else if (useTemporaryPassword && typeof (user as any).temporaryPassword === 'string' && (user as any).temporaryPassword.trim().length >= 6) {
      // Use temporaryPassword from the user document
      passwordToHash = (user as any).temporaryPassword.trim()
      tempPassword = passwordToHash
    } else {
      // Fallback: generate a temporary password
      tempPassword = generateTempPassword()
      passwordToHash = tempPassword
    }

    const { hash } = hashPassword(passwordToHash)

    // Update user password and clear temporaryPassword if present
    const patch = client.patch(userId).set({ passwordHash: hash })
    if ((user as any).temporaryPassword) {
      patch.unset(['temporaryPassword'])
    }
    await patch.commit()

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset successfully',
        tempPassword: tempPassword ?? undefined,
        userEmail: user.email,
        instruction: tempPassword
          ? `Share this temporary password with the user: ${tempPassword}`
          : 'Password updated successfully.',
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reset password' },
      { status: 500 }
    )
  }
}
