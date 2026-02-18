import { NextRequest, NextResponse } from 'next/server'
import paymentService from '@/lib/payment'
import hubtelService from '@/lib/hubtel'
import { serverClient, assertSanityToken, decrementStock } from '@/lib/sanity-server'

// =============================================================================
// POST /api/payment/verify   — called by the verify page after redirect
// GET  /api/payment/verify?reference=xxx&provider=paystack|hubtel
//
// Supports both Paystack (reference-based) and Hubtel (clientReference-based).
// For Hubtel the webhook already handles fulfillment, so this mostly checks
// status and returns info to the client.
// =============================================================================

/**
 * Fulfil an order in Sanity: create payment record, update order, decrement
 * stock, fire SMS. Idempotent — skips if already paid.
 */
async function fulfillOrder(opts: {
  orderId: string
  reference: string
  amount: number
  channel: string
  provider: 'paystack' | 'hubtel'
  customerEmail?: string
  customerPhone?: string
  customerName?: string
  paidAt?: string | null
}) {
  assertSanityToken()

  // Idempotency
  const order = await serverClient.getDocument(opts.orderId)
  if (!order) return { alreadyProcessed: false, error: 'Order not found' }
  if (order.paymentStatus === 'paid') return { alreadyProcessed: true }

  // Payment record
  await serverClient.create({
    _type: 'payment',
    reference: opts.reference,
    orderId: { _type: 'reference', _ref: opts.orderId },
    amount: opts.amount,
    currency: 'GHS',
    status: 'success',
    customerEmail: opts.customerEmail,
    customerPhone: opts.customerPhone,
    paymentMethod: opts.channel,
    provider: opts.provider,
    paidAt: opts.paidAt || new Date().toISOString(),
    verifiedAt: new Date().toISOString(),
  })

  // Update order
  await serverClient
    .patch(opts.orderId)
    .set({
      paymentStatus: 'paid',
      status: 'processing',
      paymentReference: opts.reference,
      'metadata.paymentMethod': opts.channel,
      'metadata.provider': opts.provider,
      'metadata.paidAt': opts.paidAt || new Date().toISOString(),
    })
    .commit()

  // Decrement stock
  if (order.items?.length) {
    try {
      await decrementStock(
        order.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
        }))
      )
    } catch (stockErr) {
      console.error('[payment/verify] stock decrement failed:', stockErr)
    }
  }

  // SMS (fire-and-forget)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const phone = opts.customerPhone || order.customer?.phone
  if (phone) {
    fetch(`${siteUrl}/api/sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'payment_confirmation',
        data: {
          customerName: opts.customerName || order.customer?.firstName || 'Valued Customer',
          customerPhone: phone,
          orderId: opts.orderId,
          amount: opts.amount,
          paymentMethod: opts.channel,
        },
      }),
    }).catch((e) => console.error('[payment/verify] customer SMS failed:', e))
  }

  fetch(`${siteUrl}/api/settings`)
    .then((r) => r.json())
    .then((settings) => {
      const adminPhone = settings?.data?.adminPhone
      if (adminPhone) {
        return fetch(`${siteUrl}/api/sms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'new_order_alert',
            data: { adminPhone, orderId: opts.orderId, total: opts.amount },
          }),
        })
      }
    })
    .catch((e) => console.error('[payment/verify] admin SMS failed:', e))

  return { alreadyProcessed: false }
}

// --------------- Paystack verify & fulfil ------------------------------------

async function verifyPaystack(reference: string) {
  const result = await paymentService.verifyPayment(reference)

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: 'Payment was not successful', status: result.status },
      { status: 400 }
    )
  }

  const orderId: string = result.metadata?.orderId || ''

  try {
    const fulfillResult = await fulfillOrder({
      orderId,
      reference: result.reference,
      amount: result.amountGHS,
      channel: result.channel,
      provider: 'paystack',
      customerEmail: result.customer.email,
      customerPhone: result.customer.phone || result.metadata?.customerPhone,
      customerName: result.metadata?.customerName,
      paidAt: result.paidAt,
    })

    return NextResponse.json({
      success: true,
      alreadyProcessed: fulfillResult.alreadyProcessed || false,
      orderId,
      amount: result.amountGHS,
      channel: result.channel,
      reference: result.reference,
      paidAt: result.paidAt,
      provider: 'paystack',
    })
  } catch (err) {
    console.error('[payment/verify] Paystack fulfillment error:', err)
    // Payment IS verified even if Sanity fails
    return NextResponse.json({
      success: true,
      alreadyProcessed: false,
      orderId,
      amount: result.amountGHS,
      channel: result.channel,
      reference: result.reference,
      provider: 'paystack',
    })
  }
}

// --------------- Hubtel verify & fulfil --------------------------------------

async function verifyHubtel(clientReference: string) {
  // Check payment status with Hubtel
  const result = await hubtelService.checkStatus(clientReference)

  if (!result.success) {
    // The webhook may not have fired yet. Check if the order is already paid
    // (webhook may have processed it).
    try {
      assertSanityToken()
      const order = await serverClient.getDocument(clientReference)
      if (order?.paymentStatus === 'paid') {
        return NextResponse.json({
          success: true,
          alreadyProcessed: true,
          orderId: clientReference,
          provider: 'hubtel',
        })
      }
    } catch {}

    return NextResponse.json(
      { success: false, error: 'Payment not yet confirmed', status: result.status, provider: 'hubtel' },
      { status: 400 }
    )
  }

  // Hubtel payment confirmed — fulfil (webhook may have already done this,
  // fulfillOrder is idempotent).
  try {
    const fulfillResult = await fulfillOrder({
      orderId: clientReference,
      reference: result.transactionId || clientReference,
      amount: result.amount,
      channel: `hubtel_${result.paymentMethod}`,
      provider: 'hubtel',
      customerPhone: result.customerPhone,
      paidAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      alreadyProcessed: fulfillResult.alreadyProcessed || false,
      orderId: clientReference,
      amount: result.amount,
      channel: `hubtel_${result.paymentMethod}`,
      reference: result.transactionId,
      provider: 'hubtel',
    })
  } catch (err) {
    console.error('[payment/verify] Hubtel fulfillment error:', err)
    return NextResponse.json({
      success: true,
      alreadyProcessed: false,
      orderId: clientReference,
      amount: result.amount,
      provider: 'hubtel',
    })
  }
}

// --------------- Route handlers ----------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference, provider = 'paystack', clientReference } = body

    if (provider === 'hubtel') {
      const ref = clientReference || reference
      if (!ref) {
        return NextResponse.json({ success: false, error: 'Client reference is required' }, { status: 400 })
      }
      return await verifyHubtel(ref)
    }

    // Default: Paystack
    if (!reference) {
      return NextResponse.json({ success: false, error: 'Reference is required' }, { status: 400 })
    }
    return await verifyPaystack(reference)
  } catch (error) {
    console.error('[payment/verify] POST error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const reference = url.searchParams.get('reference')
    const clientReference = url.searchParams.get('clientReference')
    const provider = url.searchParams.get('provider') || 'paystack'

    if (provider === 'hubtel') {
      const ref = clientReference || reference
      if (!ref) {
        return NextResponse.json({ success: false, error: 'Client reference is required' }, { status: 400 })
      }
      return await verifyHubtel(ref)
    }

    // Default: Paystack
    if (!reference) {
      return NextResponse.json({ success: false, error: 'Reference is required' }, { status: 400 })
    }
    return await verifyPaystack(reference)
  } catch (error) {
    console.error('[payment/verify] GET error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500 }
    )
  }
}
