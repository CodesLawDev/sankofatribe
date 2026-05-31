import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth-utils'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const FLASHSMS_API_URL = 'https://app.flashsms.africa/api/v1'

export async function GET(request: NextRequest) {
    try {
        // Check admin authentication
        const cookieStore = cookies()
        const token = cookieStore.get('auth-token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        // Only admins can access SMS balance
        if (payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const smsApiKey = process.env.FLASHSMS_API_KEY

        if (!smsApiKey) {
            return NextResponse.json({
                balance: 0,
                currency: 'credits',
                error: 'SMS service not configured',
            })
        }

        const response = await fetch(`${FLASHSMS_API_URL}/balance`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${smsApiKey}`,
                'Content-Type': 'application/json',
            },
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('FlashSMS balance API error:', data)
            // Return a default error response with a fallback message
            return NextResponse.json({
                balance: 0,
                currency: 'credits',
                error: data.error || 'Unable to fetch SMS balance',
            })
        }

        const balance = data.data?.balance || 0
        const currency = data.data?.currency || 'credits'

        return NextResponse.json({
            balance,
            currency,
            status: 'success',
        })
    } catch (error: any) {
        console.error('SMS balance error:', error)
        // Return a default response instead of failing
        return NextResponse.json({
            balance: 0,
            currency: 'GHS',
            error: 'Failed to fetch SMS balance',
        })
    }
}
