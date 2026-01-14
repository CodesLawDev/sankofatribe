import { NextRequest, NextResponse } from 'next/server'
import paymentService from '@/lib/payment'
import { serverClient, assertSanityToken, decrementStock } from '@/lib/sanity-server'

async function verify(reference: string) {
    // Verify payment with Paystack
    const result = await paymentService.verifyPayment(reference)

    if (!result.status && !result.success) {
        return NextResponse.json(
            {
                success: false,
                error: 'Payment verification failed',
                data: result,
            },
            { status: 400 }
        )
    }

    const data: any = (result as any).data || {}

    // Try to record payment in Sanity and decrement stock
    try {
        assertSanityToken()
        
        const paystackData = data.metadata || {}
        const orderId = paystackData.orderId || `ORD-${data.reference}`

        const paymentDoc = {
            _type: 'payment',
            reference: data.reference || reference,
            orderId: { _type: 'reference', _ref: orderId },
            amount: data.amount ? data.amount / 100 : 0,
            currency: data.currency || 'GHS',
            status: 'success',
            customerEmail: data.customer?.email || '',
            customerPhone: data.customer?.phone,
            paymentMethod: data.channel,
            paidAt: data.paid_at || new Date().toISOString(),
            verifiedAt: new Date().toISOString(),
            paystackResponse: result,
        }

        await serverClient.create(paymentDoc)

        // Update order status and decrement stock
        try {
            // Fetch the order to get items
            const order = await serverClient.getDocument(orderId)
            
            if (order && order.items) {
                // Update order status
                await serverClient
                    .patch(orderId)
                    .set({ 
                        paymentStatus: 'paid',
                        status: 'processing',
                        'metadata.paymentMethod': data.channel,
                        'metadata.paidAt': data.paid_at || new Date().toISOString()
                    })
                    .commit()

                // Decrement stock for all items in the order
                await decrementStock(
                    order.items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        selectedSize: item.selectedSize
                    }))
                )

                console.log(`Stock decremented for order ${orderId}`)
            }
        } catch (stockError) {
            console.error('Failed to decrement stock:', stockError)
            // Don't fail the payment verification, but log the error
        }
    } catch (sanityError) {
        console.warn('Failed to record payment in Sanity:', sanityError)
        // Continue anyway - payment is verified even if Sanity logging fails
    }

    return NextResponse.json({
        success: true,
        amount: data.amount,
        channel: data.channel,
        paidAt: data.paid_at,
        metadata: data.metadata,
        data,
    })
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const reference = body?.reference

        if (!reference) {
            return NextResponse.json({ error: 'Reference is required' }, { status: 400 })
        }

        return await verify(reference)
    } catch (error) {
        console.error('Payment verification error:', error)
        const message = error instanceof Error ? error.message : 'Failed to verify payment'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const reference = searchParams.get('reference')
        if (!reference) {
            return NextResponse.json({ error: 'Reference is required' }, { status: 400 })
        }

        return await verify(reference)
    } catch (error) {
        console.error('Payment verification error:', error)
        const message = error instanceof Error ? error.message : 'Failed to verify payment'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
