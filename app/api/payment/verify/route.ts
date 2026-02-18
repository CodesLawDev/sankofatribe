import { NextRequest, NextResponse } from 'next/server'
import paymentService from '@/lib/payment'
import { serverClient, assertSanityToken, decrementStock } from '@/lib/sanity-server'

// =============================================================================
// POST /api/payment/verify   — called by the verify page after Paystack redirect
// GET  /api/payment/verify?reference=xxx  — also supports GET
// =============================================================================

async function verifyAndFulfill(reference: string) {
  // 1. Verify with Paystack
  const result = await paymentService.verifyPayment(reference)

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: 'Payment was not successful', status: result.status },
      { status: 400 }
    )
  }

  const orderId: string = result.metadata?.orderId || ''

  // 2. Record payment & update order in Sanity
  try {
    assertSanityToken()

    // Check if already processed (idempotency)
    if (orderId) {
      const order = await serverClient.getDocument(orderId)
      if (order?.paymentStatus === 'paid') {
        // Already fulfilled — return success without re-processing
        return NextResponse.json({
          success: true,
          alreadyProcessed: true,
          orderId,
          amount: result.amountGHS,
          channel: result.channel,
          reference: result.reference,
        })
      }
    }

    // Create payment record
    await serverClient.create({
      _type: 'payment',
      reference: result.reference,
      orderId: orderId ? { _type: 'reference', _ref: orderId } : undefined,
      amount: result.amountGHS,
      currency: 'GHS',
      status: 'success',
      customerEmail: result.customer.email,
      customerPhone: result.customer.phone,
      paymentMethod: result.channel,
      paidAt: result.paidAt || new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
    })

    // Update order status + decrement stock
    if (orderId) {
      const order = await serverClient.getDocument(orderId)

      if (order) {
        await serverClient
          .patch(orderId)
          .set({
            paymentStatus: 'paid',
            status: 'processing',
            paymentReference: result.reference,
            'metadata.paymentMethod': result.channel,
            'metadata.paidAt': result.paidAt || new Date().toISOString(),
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
      }
    }

    // 3. Send SMS notifications (best-effort, don't block response)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Customer SMS
    if (result.metadata?.customerPhone) {
      fetch(`${siteUrl}/api/sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'payment_confirmation',
          data: {
            customerName: result.metadata.customerName || 'Valued Customer',
            customerPhone: result.metadata.customerPhone,
            orderId,
            amount: result.amountGHS,
            paymentMethod: result.channel,
          },
        }),
      }).catch((e) => console.error('[payment/verify] customer SMS failed:', e))
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
              data: { adminPhone, orderId, total: result.amountGHS },
            }),
          })
        }
      })
      .catch((e) => console.error('[payment/verify] admin SMS failed:', e))
  } catch (sanityErr) {
    // Payment IS verified even if Sanity recording fails
    console.error('[payment/verify] Sanity post-processing error:', sanityErr)
  }

  return NextResponse.json({
    success: true,
    alreadyProcessed: false,
    orderId,
    amount: result.amountGHS,
    channel: result.channel,
    reference: result.reference,
    paidAt: result.paidAt,
  })
}

// --------------- Route handlers ----------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()
    if (!reference) {
      return NextResponse.json({ success: false, error: 'Reference is required' }, { status: 400 })
    }
    return await verifyAndFulfill(reference)
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
    const reference = new URL(request.url).searchParams.get('reference')
    if (!reference) {
      return NextResponse.json({ success: false, error: 'Reference is required' }, { status: 400 })
    }
    return await verifyAndFulfill(reference)
  } catch (error) {
    console.error('[payment/verify] GET error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500 }
    )
  }
}
