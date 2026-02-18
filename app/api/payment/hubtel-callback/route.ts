import { NextRequest, NextResponse } from 'next/server'
import hubtelService from '@/lib/hubtel'
import { fulfillOrder } from '@/lib/fulfillOrder'

// =============================================================================
// POST /api/payment/hubtel-callback
// Hubtel sends a POST webhook here after the customer completes (or fails)
// payment on the Hubtel checkout page.
// This is the server-to-server notification — the customer may not even be
// on the site when this fires.
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('[hubtel-callback] received:', JSON.stringify(body, null, 2))

    // ---- Webhook signature verification ----
    const authHeader = request.headers.get('authorization')
    if (!hubtelService.verifyWebhookSignature(body, authHeader)) {
      console.error('[hubtel-callback] webhook signature verification failed')
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const parsed = hubtelService.parseCallback(body)

    if (!parsed.success) {
      console.log('[hubtel-callback] payment not successful:', parsed.status)
      return NextResponse.json({ success: false, message: 'Payment not successful' })
    }

    const orderId = parsed.clientReference
    if (!orderId) {
      console.error('[hubtel-callback] no clientReference in callback')
      return NextResponse.json({ success: false, message: 'No order reference' })
    }

    // Use shared fulfillment logic (idempotent — safe to call from both
    // the webhook and the verify endpoint)
    try {
      const result = await fulfillOrder({
        orderId,
        reference: parsed.transactionId || orderId,
        amount: parsed.amount,
        channel: `hubtel_${parsed.paymentMethod}`,
        provider: 'hubtel',
        customerPhone: parsed.customerPhone,
        paidAt: new Date().toISOString(),
      })

      if (result.error) {
        console.error('[hubtel-callback]', result.error)
      } else {
        console.log('[hubtel-callback] order fulfilled:', orderId, result.alreadyProcessed ? '(already processed)' : '')
      }
    } catch (err) {
      console.error('[hubtel-callback] fulfillment error:', err)
    }

    // Always return 200 to Hubtel so they don't retry
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[hubtel-callback] error:', error)
    // Still return 200 to prevent Hubtel retries
    return NextResponse.json({ success: false, message: 'Internal error' })
  }
}
