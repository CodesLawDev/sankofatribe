import { NextRequest, NextResponse } from 'next/server'
import paymentService from '@/lib/payment'

interface VerifyPaymentRequest {
    reference: string
}

export async function POST(request: NextRequest) {
    try {
        const body: VerifyPaymentRequest = await request.json()
        const { reference } = body

        if (!reference) {
            return NextResponse.json(
                { error: 'Reference is required' },
                { status: 400 }
            )
        }

        // Verify payment with Paystack
        const result = await paymentService.verifyPayment(reference)

        if (!result.status) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Payment verification failed',
                    data: result,
                },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            data: result,
        })
    } catch (error) {
        console.error('Payment verification error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to verify payment',
            },
            { status: 500 }
        )
    }
}
