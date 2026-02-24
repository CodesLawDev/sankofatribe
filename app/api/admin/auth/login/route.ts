import { NextRequest, NextResponse } from 'next/server'
import { loginUser, createToken } from '@/lib/auth-utils'
import { cookies } from 'next/headers'
import { createRateLimiter } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const adminLoginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 })
const SESSION_MAX_AGE = 5 * 60 // 5 minutes of inactivity

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    if (!adminLoginLimiter.check(ip)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Login user from Postgres database
    const user = await loginUser(email, password)

    // Check if user is admin or superadmin (has admin access)
    if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Admin access required. Please use customer login.' },
        { status: 403 }
      )
    }

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Set HTTP-only cookie
    const cookieStore = cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    })
  } catch (error: any) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 401 }
    )
  }
}
