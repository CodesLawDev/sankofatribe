import { serverClient, assertSanityToken, decrementStock } from '@/lib/sanity-server'

// =============================================================================
// Shared order fulfilment logic
//
// Idempotent: creates payment record, updates order, decrements stock, sends
// SMS. Safe to call from both the verify endpoint AND webhooks.
// =============================================================================

export interface FulfillOrderOpts {
  orderId: string
  reference: string
  amount: number
  channel: string
  provider: 'paystack' | 'hubtel'
  customerEmail?: string
  customerPhone?: string
  customerName?: string
  paidAt?: string | null
}

export interface FulfillResult {
  alreadyProcessed: boolean
  error?: string
}

export async function fulfillOrder(opts: FulfillOrderOpts): Promise<FulfillResult> {
  assertSanityToken()

  // Idempotency check
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
      console.error('[fulfillOrder] stock decrement failed:', stockErr)
    }
  }

  // Increment promo code usage (post-payment, not pre-payment)
  if (order.promoCode) {
    try {
      const promoQuery = `*[_type == "promoCode" && code == $code][0]{ _id, timesUsed }`
      const promo = await serverClient.fetch(promoQuery, { code: order.promoCode.toUpperCase() })
      if (promo) {
        await serverClient
          .patch(promo._id)
          .set({ timesUsed: (promo.timesUsed || 0) + 1 })
          .commit()
      }
    } catch (promoErr) {
      console.error('[fulfillOrder] promo usage increment failed:', promoErr)
    }
  }

  // SMS (fire-and-forget via internal API)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const phone = opts.customerPhone || order.customer?.phone
  if (phone) {
    fetch(`${siteUrl}/api/sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_API_SECRET || '',
      },
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
    }).catch((e) => console.error('[fulfillOrder] customer SMS failed:', e))
  }

  fetch(`${siteUrl}/api/settings`, {
    headers: {
      'x-internal-secret': process.env.INTERNAL_API_SECRET || '',
    },
  })
    .then((r) => r.json())
    .then((settings) => {
      const adminPhone = settings?.data?.adminPhone
      if (adminPhone) {
        return fetch(`${siteUrl}/api/sms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': process.env.INTERNAL_API_SECRET || '',
          },
          body: JSON.stringify({
            type: 'new_order_alert',
            data: { adminPhone, orderId: opts.orderId, total: opts.amount },
          }),
        })
      }
    })
    .catch((e) => console.error('[fulfillOrder] admin SMS failed:', e))

  return { alreadyProcessed: false }
}
