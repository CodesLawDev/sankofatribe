import { NextRequest, NextResponse } from 'next/server'
import { serverClient, assertSanityToken } from '@/lib/sanity-server'

export async function POST(req: NextRequest) {
    try {
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

        await serverClient
            .patch(orderId)
            .set({
                paymentStatus: paymentData?.paymentStatus || 'paid',
                paymentReference: paymentData?.paymentReference,
                status: 'processing',
                metadata: {
                    paymentMethod: paymentData?.paymentMethod,
                    paidAt: paymentData?.paidAt,
                },
            })
            .commit()

        return NextResponse.json({ success: true, alreadyProcessed: false })
    } catch (error) {
        console.error('orders/update-payment error:', error)
        const message = error instanceof Error ? error.message : 'Failed to update payment status'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
