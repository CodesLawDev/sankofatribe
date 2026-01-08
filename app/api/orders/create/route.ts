import { NextRequest, NextResponse } from 'next/server'
import { serverClient, assertSanityToken } from '@/lib/sanity-server'

export async function POST(req: NextRequest) {
    try {
        assertSanityToken()

        const body = await req.json()
        const {
            orderId = `ORD-${Date.now()}`,
            orderDate,
            status = 'pending_payment',
            customer,
            shippingAddress,
            items,
            subtotal = 0,
            shippingCost = 0,
            tax = 0,
            total = 0,
            paymentStatus = 'pending',
        } = body || {}

        if (!customer?.email) {
            return NextResponse.json({ success: false, error: 'Missing customer email' }, { status: 400 })
        }

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ success: false, error: 'No items in order' }, { status: 400 })
        }

        const orderDoc = {
            _id: orderId,
            _type: 'order',
            orderId,
            orderDate: orderDate || new Date().toISOString(),
            status,
            paymentStatus,
            customer,
            shippingAddress,
            items,
            subtotal,
            shippingCost,
            tax,
            total,
            metadata: {
                paymentMethod: undefined,
                paidAt: undefined,
            },
        }

        await serverClient.createOrReplace(orderDoc)

        return NextResponse.json({ success: true, orderId })
    } catch (error) {
        console.error('orders/create error:', error)
        const message = error instanceof Error ? error.message : 'Failed to create order'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
