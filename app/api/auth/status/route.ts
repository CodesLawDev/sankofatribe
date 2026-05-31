import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const token = cookies().get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ authenticated: false })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      },
    })
  } catch {
    return NextResponse.json({ authenticated: false })
  }
}
