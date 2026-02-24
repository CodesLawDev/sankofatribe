import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPrisma, hashPassword, verifyToken } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

const ALLOWED_STATUSES = new Set(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'])
const ALLOWED_ROLES = new Set(['ADMIN', 'SUPERADMIN'])

async function getActingUser() {
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
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, role: true, permissions: true },
  })

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }) }
  }

  const canManageUsers =
    user.role === 'SUPERADMIN' ||
    (user.role === 'ADMIN' && user.permissions.includes('manage_users'))

  if (!canManageUsers) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }) }
  }

  return { payload, user, prisma }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const acting = await getActingUser()
    if ('error' in acting) return acting.error

    const { prisma, user: actingUser } = acting

    const targetUser = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true, role: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (targetUser.role === 'SUPERADMIN' && actingUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const {
      email,
      firstName,
      lastName,
      phone,
      role,
      permissions,
      status,
      password,
    } = body

    const updates: Record<string, unknown> = {}

    if (typeof email === 'string' && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase()
      const existingEmail = await prisma.user.findFirst({
        where: { email: normalizedEmail, NOT: { id: params.userId } },
        select: { id: true },
      })

      if (existingEmail) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
      }

      updates.email = normalizedEmail
    }

    if (typeof phone === 'string') {
      const normalizedPhone = phone.trim()
      if (normalizedPhone) {
        const existingPhone = await prisma.user.findFirst({
          where: { phone: normalizedPhone, NOT: { id: params.userId } },
          select: { id: true },
        })

        if (existingPhone) {
          return NextResponse.json({ error: 'Phone number already in use' }, { status: 400 })
        }
      }

      updates.phone = normalizedPhone || null
    }

    if (typeof firstName === 'string' && firstName.trim()) {
      updates.firstName = firstName.trim()
    }

    if (typeof lastName === 'string' && lastName.trim()) {
      updates.lastName = lastName.trim()
    }

    if (typeof role === 'string' && ALLOWED_ROLES.has(role)) {
      updates.role = role
    }

    if (Array.isArray(permissions)) {
      updates.permissions = permissions
    }

    if (typeof status === 'string' && ALLOWED_STATUSES.has(status)) {
      updates.status = status
    }

    if (typeof password === 'string' && password.trim().length >= 6) {
      updates.passwordHash = await hashPassword(password.trim())
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: updates,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        permissions: true,
        status: true,
        lastLogin: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    })
  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const acting = await getActingUser()
    if ('error' in acting) return acting.error

    const { prisma, user: actingUser, payload } = acting

    if (params.userId === payload.userId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true, role: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (targetUser.role === 'SUPERADMIN' && actingUser.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.user.delete({ where: { id: params.userId } })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error: any) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    )
  }
}
