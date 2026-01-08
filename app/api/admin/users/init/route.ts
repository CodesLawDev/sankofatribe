import { NextRequest, NextResponse } from 'next/server'
import { serverClient, assertSanityToken } from '@/lib/sanity-server'
import { hashPassword } from '@/lib/passwordUtils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Bootstrap endpoint to set the first admin user's password.
 *
 * POST /api/admin/users/init
 * Body: { email?: string, userId?: string, password: string, secret?: string }
 * Header alternative: x-admin-init-secret: <ADMIN_INIT_SECRET>
 *
 * Rules:
 * - If there are zero users with a defined passwordHash, allow without secret.
 * - If any user already has a passwordHash, require secret to run.
 * - Uses SANITY_WRITE_TOKEN; will error if missing.
 */
export async function POST(request: NextRequest) {
  try {
    assertSanityToken()

    const body = await request.json()
    const email: string | undefined = body.email?.trim()
    const userId: string | undefined = body.userId?.trim()
    const password: string | undefined = body.password?.trim()
    const secretFromBody: string | undefined = body.secret?.trim()
    const secretFromHeader = request.headers.get('x-admin-init-secret') || undefined

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Check whether any user already has a hashed password
    const hashedCount: number = await serverClient.fetch(
      'count(*[_type == "user" && defined(passwordHash)])'
    )

    const initSecret = process.env.ADMIN_INIT_SECRET
    const providedSecret = secretFromBody || secretFromHeader

    if (hashedCount > 0) {
      if (!initSecret) {
        return NextResponse.json({ error: 'Initialization locked: set ADMIN_INIT_SECRET to allow.' }, { status: 403 })
      }
      if (!providedSecret || providedSecret !== initSecret) {
        return NextResponse.json({ error: 'Forbidden: invalid initialization secret' }, { status: 403 })
      }
    }

    // Resolve target user
    let user: any | null = null
    if (userId) {
      user = await serverClient.getDocument(userId)
    } else if (email) {
      user = await serverClient.fetch('*[_type == "user" && email == $email][0]', { email })
    }

    const { hash } = hashPassword(password)

    if (user) {
      // Patch existing user: set passwordHash, ensure active and admin role if missing
      const patch = serverClient.patch(user._id).set({
        passwordHash: hash,
        isActive: user.isActive !== false,
        role: user.role || 'admin',
      })
      if (user.temporaryPassword) {
        patch.unset(['temporaryPassword'])
      }
      const updated = await patch.commit()
      return NextResponse.json({
        success: true,
        message: 'Password set for existing user',
        userId: updated._id,
        email: user.email,
        role: updated.role,
      }, { headers: { 'Cache-Control': 'no-store' } })
    }

    if (!email) {
      return NextResponse.json({ error: 'User not found. Provide a valid email or userId.' }, { status: 404 })
    }

    // Create new admin user if not found
    const now = new Date().toISOString()
    const created = await serverClient.create({
      _type: 'user',
      email,
      firstName: body.firstName || 'Admin',
      lastName: body.lastName || 'User',
      role: 'admin',
      permissions: [],
      isActive: true,
      createdAt: now,
      lastLogin: null,
      passwordHash: hash,
    })

    return NextResponse.json({
      success: true,
      message: 'Admin user created and password set',
      userId: created._id,
      email,
      role: created.role,
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error: any) {
    console.error('Admin init error:', error)
    return NextResponse.json({ error: error.message || 'Initialization failed' }, { status: 500 })
  }
}
