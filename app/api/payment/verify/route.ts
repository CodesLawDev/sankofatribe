import { NextRequest, NextResponse } from 'next/server'
import paymentService from '@/lib/payment'
import { serverClient, assertSanityToken, decrementStock } from '@/lib/sanity-server'
import { verifyHubtelPayment } from '@/lib/hubtel'

async function verify(reference: string, provider: string) {
    const normalizedProvider = (provider || 'PAYSTACK').toUpperCase()

    if (normalizedProvider === 'PAYSTACK') {
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
                            'metadata.paymentMethod': normalizedProvider,
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
            provider: 'PAYSTACK',
            amount: data.amount,
            channel: data.channel,
            paidAt: data.paid_at,
            metadata: data.metadata,
            data,
        })
    }

    if (normalizedProvider === 'HUBTEL') {
        const hubtelResult = await verifyHubtelPayment(reference)

        if (hubtelResult.status !== 'SUCCESS') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Payment verification failed',
                    data: hubtelResult,
                },
                { status: 400 }
            )
        }

        const orderId = reference

        try {
            assertSanityToken()

            const order = await serverClient.getDocument(orderId)
            if (!order) {
                return NextResponse.json(
                    { success: false, error: 'Order not found' },
                    { status: 404 }
                )
            }

            const paymentDoc = {
                _type: 'payment',
                reference: orderId,
                orderId: { _type: 'reference', _ref: orderId },
                amount: hubtelResult.amountGhs,
                currency: hubtelResult.currency || 'GHS',
                status: 'success',
                customerEmail: order.customer?.email || '',
                customerPhone: order.customer?.phone,
                paymentMethod: hubtelResult.channel,
                paidAt: hubtelResult.paidAt ? hubtelResult.paidAt.toISOString() : new Date().toISOString(),
                verifiedAt: new Date().toISOString(),
                paystackResponse: hubtelResult.raw,
                notes: 'Processed via Hubtel',
            }

            await serverClient.create(paymentDoc)

            // Update order status and decrement stock
            try {
                if (order.items) {
                    await serverClient
                        .patch(orderId)
                        .set({
                            paymentStatus: 'paid',
                            status: 'processing',
                            'metadata.paymentMethod': normalizedProvider,
                            'metadata.paidAt': hubtelResult.paidAt ? hubtelResult.paidAt.toISOString() : new Date().toISOString(),
                        })
                        .commit()

                    await decrementStock(
                        order.items.map((item: any) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            selectedSize: item.selectedSize
                        }))
                    )

                }
            } catch (stockError) {
                console.error('Failed to decrement stock:', stockError)
            }

            return NextResponse.json({
                success: true,
                provider: 'HUBTEL',
                amount: hubtelResult.amountGhs,
                channel: hubtelResult.channel,
                paidAt: hubtelResult.paidAt?.toISOString(),
                metadata: {
                    orderId,
                    customerName: order.customer?.firstName || '',
                    customerPhone: order.customer?.phone || '',
                },
                data: hubtelResult.raw,
            })
        } catch (sanityError) {
            console.warn('Failed to record payment in Sanity:', sanityError)
            return NextResponse.json({
                success: true,
                provider: 'HUBTEL',
                amount: hubtelResult.amountGhs,
                channel: hubtelResult.channel,
                paidAt: hubtelResult.paidAt?.toISOString(),
                metadata: {
                    orderId,
                },
                data: hubtelResult.raw,
            })
        }
    }

    return NextResponse.json(
        { success: false, error: `Unsupported payment provider: ${normalizedProvider}` },
        { status: 400 }
    )
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const reference = body?.reference

        if (!reference) {
            return NextResponse.json({ error: 'Reference is required' }, { status: 400 })
        }

        const provider = body?.provider
        return await verify(reference, provider)
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

        const provider = searchParams.get('provider')
        return await verify(reference, provider || 'PAYSTACK')
    } catch (error) {
        console.error('Payment verification error:', error)
        const message = error instanceof Error ? error.message : 'Failed to verify payment'
        return NextResponse.json({ success: false, error: message }, { status: 500 })
    }
}
