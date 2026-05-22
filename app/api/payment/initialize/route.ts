import { NextRequest, NextResponse } from 'next/server'
import hubtelService from '@/lib/hubtel'
import paymentService from '@/lib/payment'
import { resolveProvider, type PaymentProvider } from '@/lib/payment-gateways'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      amount,
      orderId,
      items = [],
      provider: requestedProvider,
      customerEmail = 'guest@sankofatribe.com',
    } = body

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

    let provider: PaymentProvider
    try {
      provider = await resolveProvider('productCheckout', requestedProvider)
    } catch (err) {
      return NextResponse.json(
        { success: false, error: err instanceof Error ? err.message : 'No payment gateway available' },
        { status: 503 }
      )
    }

    if (provider === 'paystack') {
      const paystackSecret = process.env.PAYSTACK_SECRET_KEY
      if (!paystackSecret) {
        return NextResponse.json(
          { success: false, error: 'Paystack is not configured. Please contact support.' },
          { status: 500 }
        )
      }

      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // convert to pesewas/kobo
          email: customerEmail,
          reference: orderId,
          callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/verify`,
        }),
      })

      const data = await response.json()
      if (!data.status) {
        throw new Error(data.message || 'Failed to initialize Paystack payment')
      }

      return NextResponse.json({
        success: true,
        provider: 'paystack',
        authorization_url: data.data.authorization_url,
        reference: data.data.reference,
      })
    } else {
      // Hubtel logic (default)
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
