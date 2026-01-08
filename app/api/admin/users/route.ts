import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/sanity-server'
import { AdminUser } from '@/lib/adminTypes'
import { hashPassword, generateTemporaryPassword } from '@/lib/passwordUtils'

export async function GET(request: NextRequest) {
  try {
    const users = await serverClient.fetch<AdminUser[]>(
      `*[_type == "user"] | order(_createdAt desc) {
        _id,
        email,
        firstName,
        lastName,
        role,
        permissions,
        isActive,
        lastLogin,
        _createdAt
      }`
    )

    return NextResponse.json(users)
  } catch (error) {
    console.error('Admin users fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, lastName, role, permissions, password } = body

    // Validate required fields
    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existing = await serverClient.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    )

    if (existing) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password (use provided password or generate temporary)
    const actualPassword = password || generateTemporaryPassword()
    const { hash: passwordHash } = hashPassword(actualPassword)

    // Create new user
    const newUser = await serverClient.create({
      _type: 'user',
      email,
      firstName,
      lastName,
      role,
      permissions: role === 'admin' ? [] : (permissions || []),
      isActive: true,
      passwordHash,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        _id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
      },
      temporaryPassword: password ? undefined : actualPassword,
    })
  } catch (error) {
    console.error('Admin user creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
