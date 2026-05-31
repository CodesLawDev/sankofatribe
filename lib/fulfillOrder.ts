import { serverClient, assertSanityToken, decrementStock } from '@/lib/sanity-server'
import { syncOrderUpdateToDb, syncPaymentToDb } from '@/lib/sync-to-db'
import { getPrisma } from '@/lib/auth-utils'
import { normalizeEmail } from '@/lib/promo'
import { markPromoRedeemedInBrevo } from '@/lib/brevo'

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
      paymentProvider: opts.provider,
      'metadata.paymentMethod': opts.channel,
      'metadata.provider': opts.provider,
      'metadata.paidAt': opts.paidAt || new Date().toISOString(),
    })
    .commit()

  // ---- Sync to Postgres (non-blocking) -----------------------------------
  const paidAtStr = opts.paidAt || new Date().toISOString()

  syncOrderUpdateToDb({
    sanityId:         opts.orderId,
    status:           'processing',
    paymentStatus:    'paid',
    paymentReference: opts.reference,
    paymentProvider:  opts.provider,
    paymentMethod:    opts.channel,
    paidAt:           paidAtStr,
  }).catch((e) => console.error('[fulfillOrder] DB order sync failed:', e))

  syncPaymentToDb({
    reference:      opts.reference,
    sanityOrderId:  opts.orderId,
    amount:         opts.amount,
    currency:       'GHS',
    status:         'success',
    provider:       opts.provider,
    paymentMethod:  opts.channel,
    customerEmail:  opts.customerEmail,
    customerPhone:  opts.customerPhone,
    paidAt:         paidAtStr,
    verifiedAt:     new Date().toISOString(),
  }).catch((e) => console.error('[fulfillOrder] DB payment sync failed:', e))

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

  // Promo redemption (post-payment, not pre-payment). Records a per-customer
  // redemption so usage limits can be enforced, bumps the global counter, and
  // syncs the redemption flag back to Brevo. The paymentStatus === 'paid' guard
  // above already makes this whole function idempotent per order.
  if (order.promoCode) {
    const code = String(order.promoCode).toUpperCase()
    const rawEmail = order.customer?.email || ''
    // Lenient key (lowercase) matches how subscribers/Brevo contacts are stored;
    // normalized key (+tags & Gmail dots stripped) is only for the abuse-limit
    // record, kept consistent with the per-customer count in lib/promo.ts.
    const lowerEmail = rawEmail.trim().toLowerCase()
    const normalizedEmail = rawEmail ? normalizeEmail(rawEmail) : ''

    // Per-customer redemption record (DB). Unique on [code, orderId] guards
    // against any accidental double-processing.
    if (lowerEmail) {
      try {
        const prisma = getPrisma()
        await prisma.promoRedemption.upsert({
          where: { code_orderId: { code, orderId: opts.orderId } },
          update: {},
          create: {
            code,
            email: normalizedEmail,
            orderId: opts.orderId,
            orderNumber: order.orderId || opts.orderId,
            discount: order.discount || 0,
          },
        })
      } catch (redErr) {
        console.error('[fulfillOrder] promo redemption record failed:', redErr)
      }

      // Best-effort marketing write-back. Use the lenient (lowercased) email so
      // the Brevo contact lookup matches the address used at subscription time.
      markPromoRedeemedInBrevo(lowerEmail, code).catch((e) =>
        console.error('[fulfillOrder] Brevo promo write-back failed:', e)
      )
    }

    // Global usage counter in Sanity.
    try {
      const promoQuery = `*[_type == "promoCode" && code == $code][0]{ _id, timesUsed }`
      const promo = await serverClient.fetch(promoQuery, { code })
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
