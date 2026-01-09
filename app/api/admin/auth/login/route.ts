import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/sanity-server'
import { AdminUser } from '@/lib/adminTypes'
import { verifyPassword } from '@/lib/passwordUtils'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Fetch user from Sanity
    const user = await serverClient.fetch<any>(
      `*[_type == "user" && email == $email][0]`,
      { email }
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive. Contact administrator.' },
        { status: 401 }
      )
    }

    // Verify password
    if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Update last login
    await serverClient.patch(user._id).set({ lastLogin: new Date().toISOString() }).commit()

    const adminUser: AdminUser = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: user.role === 'admin' ? [] : (user.permissions || []),
      isActive: user.isActive,
      lastLogin: new Date().toISOString(),
    }

    // Issue signed JWT for middleware validation
    const token = await new SignJWT({ sub: user._id, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET)

    const response = NextResponse.json({
      user: adminUser,
      token,
      message: 'Login successful',
    })

    // Set httpOnly cookie for middleware
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    })

    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}
