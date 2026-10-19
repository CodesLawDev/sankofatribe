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

    // ---- Trust model ----
    // Hubtel callbacks are not reliably signed, so the body is treated only as
    // a hint about WHICH order to check. Payment status and amount always come
    // from Hubtel's status API, so a forged callback cannot fulfil an order.
    const parsed = hubtelService.parseCallback(body)

    const orderId = parsed.clientReference
    if (!orderId) {
      console.error('[hubtel-callback] no clientReference in callback')
      return NextResponse.json({ success: false, message: 'No order reference' })
    }

    const status = await hubtelService.checkStatus(orderId)
    if (!status.success) {
      console.log('[hubtel-callback] status API reports not paid:', orderId, status.status)
      return NextResponse.json({ success: false, message: 'Payment not successful' })
    }

    // Use shared fulfillment logic (idempotent — safe to call from both
    // the webhook and the verify endpoint)
    try {
      const result = await fulfillOrder({
        orderId,
        reference: status.transactionId || parsed.transactionId || orderId,
        amount: status.amount,
        channel: `hubtel_${status.paymentMethod || parsed.paymentMethod}`,
        provider: 'hubtel',
        customerPhone: status.customerPhone || parsed.customerPhone,
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
