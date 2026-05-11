import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getPrisma, hashPassword } from '@/lib/auth-utils'
import { generateTemporaryPassword } from '@/lib/passwordUtils'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

/**
 * Admin endpoint to list all staff users (from Postgres)
 * GET /api/admin/users
 * Requires: Admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Only admins can access
    if (payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get pagination from query params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Get search/filter from query
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    // Build where clause
    const where: any = { role: { in: ['ADMIN', 'SUPERADMIN'] } }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (status) {
      where.status = status
    }

    // Get total count
    const prisma = getPrisma()
    const total = await prisma.user.count({ where })

    // Get admin users (don't include passwordHash)
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        permissions: true,
        status: true,
        registeredAt: true,
        lastLogin: true,
      },
      orderBy: { registeredAt: 'asc' },
      skip,
      take: limit,
    })

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error: any) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get users' },
      { status: 500 }
    )
  }
}

/**
 * Admin endpoint to create new staff user
 * POST /api/admin/users
 * Requires: Admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Only admins can create users
    if (payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const prisma = getPrisma()
    const actingUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true, permissions: true },
    })

    if (!actingUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const canManageUsers =
      actingUser.role === 'SUPERADMIN' ||
      (actingUser.role === 'ADMIN' && actingUser.permissions.includes('manage_users'))

    if (!canManageUsers) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { email, firstName, lastName, password, phone } = body
    const normalizedPhone = typeof phone === 'string' ? phone.trim() : ''

    // Validation
    if (!email || !firstName || !lastName || !normalizedPhone) {
      return NextResponse.json(
        { error: 'Email, firstName, lastName, and phone are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      )
    }

    const existingPhone = await prisma.user.findFirst({
      where: { phone: normalizedPhone },
    })

    if (existingPhone) {
      return NextResponse.json(
        { error: 'Phone number already in use' },
        { status: 400 }
      )
    }

    const hasProvidedPassword = typeof password === 'string' && password.trim().length > 0
    const passwordToUse = hasProvidedPassword ? password.trim() : generateTemporaryPassword()

    // Hash password
    const passwordHash = await hashPassword(passwordToUse)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        firstName,
        lastName,
        phone: normalizedPhone,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Staff user created',
        user,
        temporaryPassword: hasProvidedPassword ? undefined : passwordToUse,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    )
  }
}
