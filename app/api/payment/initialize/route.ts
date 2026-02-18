import { NextRequest, NextResponse } from 'next/server'
import paymentService from '@/lib/payment'

export async function POST(request: NextRequest) {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: 'Payment service not configured. Please contact support.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email, amount, orderId, customerName, customerPhone, items = [], channels } = body

    // Validate
    if (!email || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Email and a positive amount are required.' },
        { status: 400 }
      )
    }
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required.' },
        { status: 400 }
      )
    }

    // Initialize — lib/payment.ts handles pesewa conversion internally
    const result = await paymentService.initializePayment({
      email,
      amount,              // GHS
      orderId,
      customerName: customerName || '',
      customerPhone: customerPhone || '',
      items,
      channels: channels || ['mobile_money', 'card'],
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[payment/initialize] error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize payment',
      },
      { status: 500 }
    )
  }
}
