import { NextRequest, NextResponse } from 'next/server'
import paymentService from '@/lib/payment'
import hubtelService from '@/lib/hubtel'

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
      channels,
      provider = 'paystack',   // 'paystack' | 'hubtel'
    } = body

    // Validate common fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'A positive amount is required.' },
        { status: 400 }
      )
    }
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required.' },
        { status: 400 }
      )
    }

    // ---- Hubtel ----
    if (provider === 'hubtel') {
      if (!hubtelService.isConfigured) {
        return NextResponse.json(
          { success: false, error: 'Hubtel is not configured. Please contact support.' },
          { status: 500 }
        )
      }

      const itemNames = items.map((i: any) => i.name).join(', ')
      const result = await hubtelService.initializeCheckout({
        amount,
        description: `SankofaTribe Order ${orderId} — ${itemNames || 'Products'}`,
        clientReference: orderId,
      })

      return NextResponse.json({
        success: true,
        provider: 'hubtel',
        authorization_url: result.checkoutUrl,
        checkoutId: result.checkoutId,
        reference: result.clientReference,
      })
    }

    // ---- Paystack (default) ----
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: 'Paystack is not configured. Please contact support.' },
        { status: 500 }
      )
    }
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required for Paystack payment.' },
        { status: 400 }
      )
    }

    const result = await paymentService.initializePayment({
      email,
      amount,
      orderId,
      customerName: customerName || '',
      customerPhone: customerPhone || '',
      items,
      channels: channels || ['mobile_money', 'card'],
    })

    return NextResponse.json({ ...result, provider: 'paystack' })
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
