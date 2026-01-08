import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { UserRole, AdminUser } from './authTypes'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
)

// Re-export types for convenience
export type { UserRole, AdminUser }

// Temporary credential validation until Sanity integration is wired
export async function validateCredentials(username: string, password: string): Promise<AdminUser | null> {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || ''

    if (username !== adminUsername) return null
    if (!adminPassword) return null
    if (password !== adminPassword) return null

    return {
      id: 'admin-user',
      username: adminUsername,
      email: process.env.ADMIN_EMAIL || 'admin@sankofatribe.com',
      role: 'admin' as UserRole,
    }
  } catch (error) {
    console.error('Error validating credentials:', error)
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return password
}

export async function createToken(user: AdminUser): Promise<string> {
  const token = await new SignJWT({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  return token
}

export async function verifyToken(token: string): Promise<AdminUser | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    const payload = verified.payload
    return {
      id: payload.id as string,
      username: payload.username as string,
      email: payload.email as string,
      role: payload.role as UserRole,
    }
  } catch (error) {
    return null
  }
}

export async function getSession(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin-token')

    if (!token) {
      return null
    }

    return await verifyToken(token.value)
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

export async function setSession(user: AdminUser): Promise<NextResponse> {
  const token = await createToken(user)
  const cookieStore = await cookies()

  cookieStore.set('admin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  })

  return response
}

export async function clearSession(): Promise<NextResponse> {
  const cookieStore = await cookies()
  cookieStore.delete('admin-token')

  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin-token')

  return response
}
