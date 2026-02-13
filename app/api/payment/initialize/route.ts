import { NextRequest, NextResponse } from 'next/server'
import paymentService, { PaymentService } from '@/lib/payment'
import { generateHubtelReference, initHubtelCheckout } from '@/lib/hubtel'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            email,
            amount,
            orderId,
            customerName,
            customerPhone,
            items = [],
            reference,
            channels = ['mobile_money', 'card'],
            provider,
        } = body

        const normalizedProvider = String(provider || '').toUpperCase()
        if (!normalizedProvider) {
            return NextResponse.json(
                { success: false, error: 'Payment provider is required' },
                { status: 400 }
            )
        }

        // Validate required fields
        if (!email || !amount || amount <= 0) {
            console.error('Invalid email or amount:', { email, amount })
            return NextResponse.json(
                { success: false, error: 'Invalid email or amount' },
                { status: 400 }
            )
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

        if (normalizedProvider === 'PAYSTACK') {
            // Check if Paystack secret key is configured
            if (!process.env.PAYSTACK_SECRET_KEY) {
                console.error('PAYSTACK_SECRET_KEY is not configured')
                return NextResponse.json(
                    { success: false, error: 'Payment service not configured. Please contact support.' },
                    { status: 500 }
                )
            }

            // Initialize payment with Paystack
            const paymentResult = await paymentService.initializePayment({
                email,
                amount: PaymentService.toPesewas(amount), // Convert GHS to pesewas
                callback_url: `${baseUrl}/checkout/verify?provider=PAYSTACK`,
                reference: reference || orderId || undefined,
                channels: channels as any[],
                metadata: {
                    orderId: orderId || 'unknown',
                    customerName: customerName || '',
                    customerPhone: customerPhone || '',
                    items,
                },
            })

            return NextResponse.json({
                ...paymentResult,
                provider: 'PAYSTACK',
            })
        }

        if (normalizedProvider === 'HUBTEL') {
            const hubtelReference = reference || orderId || generateHubtelReference('ORD')
            const returnUrl = `${baseUrl}/checkout/verify?provider=HUBTEL&reference=${encodeURIComponent(hubtelReference)}`
            const callbackUrl = `${baseUrl}/api/webhooks/hubtel/payments`

            const hubtelResult = await initHubtelCheckout({
                amountGhs: amount,
                clientReference: hubtelReference,
                description: `Order ${orderId || hubtelReference}`,
                returnUrl,
                callbackUrl,
                cancellationUrl: `${baseUrl}/checkout?payment=cancelled`,
                customerName,
                customerEmail: email,
                customerPhone,
            })

            return NextResponse.json({
                success: true,
                provider: 'HUBTEL',
                authorization_url: hubtelResult.checkoutUrl,
                reference: hubtelResult.clientReference,
                checkoutId: hubtelResult.checkoutId,
            })
        }

        return NextResponse.json(
            { success: false, error: `Unsupported payment provider: ${normalizedProvider}` },
            { status: 400 }
        )
    } catch (error) {
        console.error('=== PAYMENT INIT ERROR ===')
        console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
        console.error('Error message:', error instanceof Error ? error.message : String(error))
        if (error instanceof Error && error.stack) {
            console.error('Stack:', error.stack)
        }
        console.error('Full error:', error)

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to initialize payment',
                details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
            },
            { status: 500 }
        )
    }
}
