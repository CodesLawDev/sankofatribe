import { NextRequest, NextResponse } from 'next/server'
import { serverClient, assertSanityToken, validateOrderStock } from '@/lib/sanity-server'

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
            discount = 0,
            promoCode,
            shippingCost = 0,
            tax = 0,
            total = 0,
            paymentStatus = 'pending',
            paymentMethod,
        } = body || {}

        if (!customer?.email) {
            return NextResponse.json({ success: false, error: 'Missing customer email' }, { status: 400 })
        }

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ success: false, error: 'No items in order' }, { status: 400 })
        }

        // Validate stock availability before creating order
        const stockValidation = await validateOrderStock(
            items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                selectedSize: item.selectedSize
            }))
        )

        if (!stockValidation.valid) {
            return NextResponse.json({ 
                success: false, 
                error: 'Stock validation failed', 
                stockErrors: stockValidation.errors 
            }, { status: 400 })
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
            discount,
            promoCode,
            shippingCost,
            tax,
            total,
            metadata: {
                paymentMethod: paymentMethod || undefined,
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
