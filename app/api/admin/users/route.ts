import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getPrisma, hashPassword } from '@/lib/auth-utils'
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

    const body = await request.json()
    const { email, firstName, lastName, password } = body

    // Validation
    if (!email || !firstName || !lastName || !password) {
      return NextResponse.json(
        { error: 'Email, firstName, lastName, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const prisma = getPrisma()
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        firstName,
        lastName,
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
