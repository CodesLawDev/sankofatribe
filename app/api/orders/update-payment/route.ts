import { NextRequest, NextResponse } from 'next/server'
import { serverClient, assertSanityToken } from '@/lib/sanity-server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function POST(req: NextRequest) {
    try {
        // ---- Authentication: require admin JWT ----
        const token = req.cookies.get('auth-token')?.value
        if (!token || !process.env.JWT_SECRET) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }
        try {
            const { payload } = await jwtVerify(token, JWT_SECRET!)
            if (payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN') {
                return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
            }
        } catch {
            return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 })
        }

        assertSanityToken()

        const body = await req.json()
        const { orderId, paymentData } = body || {}

        if (!orderId) {
            return NextResponse.json({ success: false, error: 'Missing orderId' }, { status: 400 })
        }

        const existing = await serverClient.getDocument(orderId)

        if (!existing) {
            return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
        }

        if (existing.paymentStatus === 'paid') {
            return NextResponse.json({ success: true, alreadyProcessed: true })
        }

        const paymentStatus = paymentData?.paymentStatus
        if (!paymentStatus) {
            return NextResponse.json({ success: false, error: 'paymentStatus is required in paymentData' }, { status: 400 })
        }

        await serverClient
            .patch(orderId)
            .set({
                paymentStatus,
                paymentReference: paymentData?.paymentReference,
                status: paymentStatus === 'paid' ? 'processing' : existing.status,
                'metadata.paymentMethod': paymentData?.paymentMethod,
                'metadata.paidAt': paymentData?.paidAt,
            })
            .commit()

        return NextResponse.json({ success: true, alreadyProcessed: false })
    } catch (error) {
        console.error('orders/update-payment error:', error)
        const message = error instanceof Error ? error.message : 'Failed to update payment status'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
