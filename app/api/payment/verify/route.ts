import { NextRequest, NextResponse } from 'next/server'
import paymentService from '@/lib/payment'

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
