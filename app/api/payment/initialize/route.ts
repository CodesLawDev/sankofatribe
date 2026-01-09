import { NextRequest, NextResponse } from 'next/server'
import paymentService, { PaymentService } from '@/lib/payment'

export async function POST(request: NextRequest) {
    try {
        // Check if Paystack secret key is configured
        if (!process.env.PAYSTACK_SECRET_KEY) {
            console.error('PAYSTACK_SECRET_KEY is not configured')
            return NextResponse.json(
                { success: false, error: 'Payment service not configured. Please contact support.' },
                { status: 500 }
            )
        }

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
        } = body

        console.log('=== PAYMENT INIT REQUEST ===')
        console.log('Email:', email)
        console.log('Amount (GHS):', amount)
        console.log('Order ID:', orderId)
        console.log('Customer:', customerName, customerPhone)
        console.log('Items:', items.length)
        console.log('Secret key exists:', !!process.env.PAYSTACK_SECRET_KEY)
        console.log('Secret key length:', process.env.PAYSTACK_SECRET_KEY?.length)

        // Validate required fields
        if (!email || !amount || amount <= 0) {
            console.error('Invalid email or amount:', { email, amount })
            return NextResponse.json(
                { success: false, error: 'Invalid email or amount' },
                { status: 400 }
            )
        }

        // Initialize payment with Paystack
        const paymentResult = await paymentService.initializePayment({
            email,
            amount: PaymentService.toPesewas(amount), // Convert GHS to pesewas
            callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/verify`,
            reference: reference || undefined,
            channels: channels as any[],
            metadata: {
                orderId: orderId || 'unknown',
                customerName: customerName || '',
                customerPhone: customerPhone || '',
                items,
            },
        })

        console.log('=== PAYMENT INIT SUCCESS ===')
        console.log('Reference:', paymentResult.reference)
        console.log('Authorization URL:', paymentResult.authorization_url?.substring(0, 50) + '...')

        return NextResponse.json(paymentResult)
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
