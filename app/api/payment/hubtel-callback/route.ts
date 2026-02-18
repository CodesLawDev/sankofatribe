import { NextRequest, NextResponse } from 'next/server'
import hubtelService from '@/lib/hubtel'
import { serverClient, assertSanityToken, decrementStock } from '@/lib/sanity-server'

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

    // ----- Fulfillment (same logic as Paystack verify) -----
    try {
      assertSanityToken()

      // Idempotency check
      const order = await serverClient.getDocument(orderId)
      if (!order) {
        console.error('[hubtel-callback] order not found:', orderId)
        return NextResponse.json({ success: false, message: 'Order not found' })
      }

      if (order.paymentStatus === 'paid') {
        console.log('[hubtel-callback] order already fulfilled:', orderId)
        return NextResponse.json({ success: true, alreadyProcessed: true })
      }

      // Create payment record
      await serverClient.create({
        _type: 'payment',
        reference: parsed.transactionId || orderId,
        orderId: { _type: 'reference', _ref: orderId },
        amount: parsed.amount,
        currency: 'GHS',
        status: 'success',
        customerPhone: parsed.customerPhone,
        paymentMethod: `hubtel_${parsed.paymentMethod}`,
        provider: 'hubtel',
        paidAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString(),
      })

      // Update order
      await serverClient
        .patch(orderId)
        .set({
          paymentStatus: 'paid',
          status: 'processing',
          paymentReference: parsed.transactionId || orderId,
          'metadata.paymentMethod': `hubtel_${parsed.paymentMethod}`,
          'metadata.provider': 'hubtel',
          'metadata.paidAt': new Date().toISOString(),
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
          console.error('[hubtel-callback] stock decrement failed:', stockErr)
        }
      }

      // SMS notifications (best-effort)
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

      // Customer SMS
      if (order.customer?.phone || parsed.customerPhone) {
        fetch(`${siteUrl}/api/sms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'payment_confirmation',
            data: {
              customerName: order.customer?.firstName
                ? `${order.customer.firstName} ${order.customer.lastName || ''}`
                : 'Valued Customer',
              customerPhone: order.customer?.phone || parsed.customerPhone,
              orderId,
              amount: parsed.amount,
              paymentMethod: `Hubtel ${parsed.paymentMethod}`,
            },
          }),
        }).catch((e) => console.error('[hubtel-callback] customer SMS failed:', e))
      }

      // Admin SMS
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
                data: { adminPhone, orderId, total: parsed.amount },
              }),
            })
          }
        })
        .catch((e) => console.error('[hubtel-callback] admin SMS failed:', e))

      console.log('[hubtel-callback] order fulfilled:', orderId)
    } catch (sanityErr) {
      console.error('[hubtel-callback] Sanity error:', sanityErr)
    }

    // Always return 200 to Hubtel so they don't retry
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[hubtel-callback] error:', error)
    // Still return 200 to prevent Hubtel retries
    return NextResponse.json({ success: false, message: 'Internal error' })
  }
}
