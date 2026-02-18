import { NextRequest, NextResponse } from 'next/server'
import paymentService from '@/lib/payment'
import hubtelService from '@/lib/hubtel'
import { serverClient, assertSanityToken } from '@/lib/sanity-server'
import { fulfillOrder } from '@/lib/fulfillOrder'

// =============================================================================
// POST /api/payment/verify   — called by the verify page after redirect
// GET  /api/payment/verify?reference=xxx&provider=paystack|hubtel
//
// Supports both Paystack (reference-based) and Hubtel (clientReference-based).
// For Hubtel the webhook already handles fulfillment, so this mostly checks
// status and returns info to the client.
// =============================================================================

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
