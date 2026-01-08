import { NextRequest, NextResponse } from 'next/server'
import paymentService from '@/lib/payment'

interface InitializePaymentRequest {
    email: string
    amount: number
    reference?: string
    channels?: string[]
    metadata?: Record<string, any>
}

export async function POST(request: NextRequest) {
    try {
        const body: InitializePaymentRequest = await request.json()
        const {
            email,
            amount,
            reference,
            channels = ['card', 'bank', 'mobile_money'],
            metadata = {},
        } = body

        // Validate required fields
        if (!email || !amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Invalid email or amount' },
                { status: 400 }
            )
        }

        // Initialize payment with Paystack
        const validChannels = channels.filter((c) => ['card', 'bank_transfer', 'mobile_money'].includes(c)) as any
        const preparedMetadata: any = metadata || {
            orderId: 'unknown',
            customerName: '',
            customerPhone: '',
            items: [],
        }

        const result = await paymentService.initializePayment({
            email,
            amount: Math.round(amount * 100), // Convert to kobo (Paystack unit)
            reference: reference || undefined,
            channels: validChannels,
            metadata: preparedMetadata,
        })

        return NextResponse.json({
            success: true,
            data: result,
        })
    } catch (error) {
        console.error('Payment initialization error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to initialize payment',
            },
            { status: 500 }
        )
    }
}
