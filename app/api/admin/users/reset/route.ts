import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPrisma, hashPassword, verifyToken } from '@/lib/auth-utils'
import { generateTemporaryPassword } from '@/lib/passwordUtils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function requireManageUsers() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) }
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return { error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) }
  }

  const prisma = getPrisma()
  const actingUser = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { role: true, permissions: true },
  })

  if (!actingUser) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }) }
  }

  const canManageUsers =
    actingUser.role === 'SUPERADMIN' ||
    (actingUser.role === 'ADMIN' && actingUser.permissions.includes('manage_users'))

  if (!canManageUsers) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }) }
  }

  return { prisma }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireManageUsers()
    if ('error' in auth) return auth.error

    const { prisma } = auth
    const { userId, useTemporaryPassword, newPassword } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let tempPassword: string | null = null
    let passwordToHash: string

    if (typeof newPassword === 'string' && newPassword.trim().length >= 6) {
      passwordToHash = newPassword.trim()
    } else if (useTemporaryPassword) {
      tempPassword = generateTemporaryPassword()
      passwordToHash = tempPassword
    } else {
      return NextResponse.json(
        { error: 'A new password or temporary password is required' },
        { status: 400 }
      )
    }

    const passwordHash = await hashPassword(passwordToHash)

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })

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
