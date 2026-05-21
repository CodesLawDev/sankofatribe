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
      email,
      customerName,
      customerPhone,
      provider: requestedProvider,
    } = body as {
      amount: number
      orderId: string
      items?: Array<{ name: string; quantity: number; price: number }>
      email?: string
      customerName?: string
      customerPhone?: string
      provider?: PaymentProvider
    }

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
      provider = await resolveProvider(requestedProvider)
    } catch (err) {
      return NextResponse.json(
        { success: false, error: err instanceof Error ? err.message : 'No payment gateway available' },
        { status: 503 }
      )
    }

    const itemNames = items.map((i: any) => i.name).join(', ')

    if (provider === 'hubtel') {
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

    // Paystack
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required for Paystack payments.' },
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
    })

    return NextResponse.json({
      success: true,
      provider: 'paystack',
      authorization_url: result.authorization_url,
      reference: result.reference,
    })
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
