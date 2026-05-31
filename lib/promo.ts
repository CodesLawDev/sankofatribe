import { serverClient } from '@/lib/sanity-server'
import { getPrisma } from '@/lib/auth-utils'
import type { PromoCode } from '@/lib/sanity'

export interface PromoLineItem {
  /** Unit price (not line total). */
  price: number
  quantity: number
}

export interface PromoValidationInput {
  code: string
  /** Order subtotal computed by the caller (server-trusted at checkout). */
  subtotal: number
  /** Product ids in the cart, for applicableProducts checks. */
  productIds?: string[]
  /** Line items, used to scope single-item discounts to one unit price. */
  items?: PromoLineItem[]
  /** Customer email — required to evaluate subscriber / per-customer / first-time rules. */
  email?: string | null
  /** Logged-in user id, if any. */
  userId?: string | null
}

export interface PromoValidationResult {
  valid: boolean
  message: string
  code?: string
  description?: string
  discountType?: PromoCode['discountType']
  discountValue?: number
  discountAmount?: number
  freeShipping?: boolean
}

const GMAIL_DOMAINS = new Set(['gmail.com', 'googlemail.com'])

/**
 * Normalize an email for redemption tracking so a single person cannot farm a
 * code with trivial aliases. Lowercases/trims, strips +tags, and collapses dots
 * for Gmail (where they are ignored by the provider).
 */
export function normalizeEmail(email: string): string {
  const trimmed = (email || '').trim().toLowerCase()
  const at = trimmed.lastIndexOf('@')
  if (at === -1) return trimmed
  let local = trimmed.slice(0, at)
  const domain = trimmed.slice(at + 1)
  const plus = local.indexOf('+')
  if (plus !== -1) local = local.slice(0, plus)
  if (GMAIL_DOMAINS.has(domain)) local = local.replace(/\./g, '')
  return `${local}@${domain}`
}

const PROMO_QUERY = `*[_type == "promoCode" && code == $code][0]{
  _id, code, description, discountType, discountValue, minimumPurchase, maxDiscount,
  usageLimit, usageLimitPerCustomer, timesUsed, validFrom, validUntil, isActive,
  firstTimeCustomerOnly, subscribersOnly, singleItemOnly,
  "applicableProducts": applicableProducts[]->_id,
  "applicableCategories": applicableCategories[]->_id
}`

export async function fetchPromo(code: string): Promise<PromoCode | null> {
  return serverClient.fetch<PromoCode | null>(PROMO_QUERY, { code: code.toUpperCase() })
}

function computeDiscount(
  promo: PromoCode,
  subtotal: number,
  items?: PromoLineItem[]
): { discountAmount: number; freeShipping: boolean } {
  // When the code applies to a single item only, the discount is computed
  // against the most expensive unit price rather than the whole subtotal.
  let base = subtotal
  if (promo.singleItemOnly && items && items.length > 0) {
    base = Math.max(...items.map((i) => (Number.isFinite(i.price) ? i.price : 0)))
  }

  let discountAmount = 0
  if (promo.discountType === 'percentage') {
    discountAmount = (base * (promo.discountValue || 0)) / 100
    if (promo.maxDiscount && promo.maxDiscount > 0 && discountAmount > promo.maxDiscount) {
      discountAmount = promo.maxDiscount
    }
  } else if (promo.discountType === 'fixed') {
    discountAmount = Math.min(promo.discountValue || 0, base)
  }
  // free_shipping → discountAmount stays 0
  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    freeShipping: promo.discountType === 'free_shipping',
  }
}

const invalid = (message: string): PromoValidationResult => ({ valid: false, message })

/**
 * Validate a promo code and compute its discount from authoritative data.
 * Used by both the preview endpoint and order creation, so the discount can
 * never be dictated by the client.
 */
export async function validateAndPricePromo(input: PromoValidationInput): Promise<PromoValidationResult> {
  const { code, subtotal, productIds, items, email, userId } = input

  if (!code || typeof code !== 'string') return invalid('Invalid promo code')
  if (typeof subtotal !== 'number' || subtotal < 0) return invalid('Invalid cart total')

  const promo = await fetchPromo(code)
  if (!promo) return invalid('Invalid promo code')
  if (!promo.isActive) return invalid('This promo code is no longer active')

  const now = new Date()
  if (promo.validFrom && now < new Date(promo.validFrom)) {
    return invalid('This promo code is not yet active')
  }
  if (promo.validUntil && now > new Date(promo.validUntil)) {
    return invalid('This promo code has expired')
  }

  if (promo.usageLimit && promo.usageLimit > 0 && (promo.timesUsed || 0) >= promo.usageLimit) {
    return invalid('This promo code has reached its usage limit')
  }

  if (promo.minimumPurchase && subtotal < promo.minimumPurchase) {
    return invalid(`Minimum purchase of GH₵${promo.minimumPurchase} required for this promo code`)
  }

  if (promo.applicableProducts && promo.applicableProducts.length > 0) {
    const applicableIds = (promo.applicableProducts as unknown as string[])
    const hasApplicable = productIds?.some((id) => applicableIds.includes(id))
    if (!hasApplicable) {
      return invalid('This promo code is not applicable to any products in your cart')
    }
  }

  // ---- Email-based eligibility (subscriber / per-customer / first-time) ----
  const needsEmailChecks =
    !!promo.subscribersOnly ||
    !!promo.firstTimeCustomerOnly ||
    (typeof promo.usageLimitPerCustomer === 'number' && promo.usageLimitPerCustomer > 0)

  if (needsEmailChecks) {
    // Lenient key (lowercase) for identity matching against stored subscriber /
    // order emails. Aggressive key (normalized: +tags & Gmail dots stripped)
    // only for the redemption count, to stop one person farming the limit with
    // trivial aliases.
    const lowerEmail = email ? email.trim().toLowerCase() : ''
    const normalized = email ? normalizeEmail(email) : ''
    if (!lowerEmail) {
      return invalid('Enter your email above to use this code')
    }

    const prisma = getPrisma()

    if (promo.subscribersOnly) {
      const subscriber = await prisma.newsletterSubscriber.findFirst({
        where: { email: { equals: lowerEmail, mode: 'insensitive' } },
        select: { status: true },
      })
      if (!subscriber || subscriber.status !== 'active') {
        return invalid('This code is for newsletter subscribers. Subscribe with this email to use it.')
      }
    }

    if (promo.firstTimeCustomerOnly) {
      const priorPaid = await prisma.order.count({
        where: {
          paymentStatus: 'paid',
          OR: [
            { customerEmail: { equals: lowerEmail, mode: 'insensitive' } },
            ...(userId ? [{ userId }] : []),
          ],
        },
      })
      if (priorPaid > 0) {
        return invalid('This promo code is only valid on your first order')
      }
    }

    if (typeof promo.usageLimitPerCustomer === 'number' && promo.usageLimitPerCustomer > 0) {
      const used = await prisma.promoRedemption.count({
        where: { code: promo.code.toUpperCase(), email: normalized },
      })
      if (used >= promo.usageLimitPerCustomer) {
        return invalid('You have already used this promo code the maximum number of times')
      }
    }
  }

  const { discountAmount, freeShipping } = computeDiscount(promo, subtotal, items)

  return {
    valid: true,
    message: 'Promo code applied successfully',
    code: promo.code,
    description: promo.description,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    discountAmount,
    freeShipping,
  }
}
