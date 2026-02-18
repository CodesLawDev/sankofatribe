import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getPrisma } from '@/lib/auth-utils'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
    try {
        const cookieStore = cookies()
        const token = cookieStore.get('auth-token')?.value

        if (!token) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        const payload = await verifyToken(token)
        if (!payload || !['ADMIN', 'SUPERADMIN'].includes(payload.role)) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        const prisma = getPrisma()
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            user,
        })
    } catch (error) {
        console.error('Session error:', error)
        return NextResponse.json(
            { error: 'Failed to get session' },
            { status: 500 }
        )
    }
}
