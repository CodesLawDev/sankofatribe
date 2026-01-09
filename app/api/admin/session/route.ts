import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
    try {
        const user = await getSession()

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
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
