import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/sanity-server'
import { AdminUser } from '@/lib/adminTypes'
import { verifyPassword } from '@/lib/passwordUtils'
import crypto from 'crypto'

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

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex')

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

    return NextResponse.json({
      user: adminUser,
      token,
      message: 'Login successful',
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}
