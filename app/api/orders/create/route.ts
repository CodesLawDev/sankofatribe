import { NextRequest, NextResponse } from 'next/server'
import { serverClient, assertSanityToken, validateOrderStock } from '@/lib/sanity-server'
import { nanoid } from 'nanoid'
import { syncOrderToDb } from '@/lib/sync-to-db'
import { findOrCreateCustomer } from '@/lib/customer-service'

export async function POST(req: NextRequest) {
  try {
    assertSanityToken()

    const body = await req.json()
    const {
      customer,
      shippingAddress,
      items,
      promoCode,
      promoDiscount = 0,
      provider = 'paystack',
    } = body || {}

    // Generate orderId server-side (never trust client)
    const orderId = `ORD-${Date.now()}-${nanoid(6)}`

    // ---- Validation ---------------------------------------------------------

    if (!customer?.email) {
      return NextResponse.json({ success: false, error: 'Customer email is required.' }, { status: 400 })
    }
    if (!customer?.firstName || !customer?.lastName) {
      return NextResponse.json({ success: false, error: 'Customer name is required.' }, { status: 400 })
    }
    if (!customer?.phone) {
      return NextResponse.json({ success: false, error: 'Customer phone is required.' }, { status: 400 })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Order must contain at least one item.' }, { status: 400 })
    }

    // ---- Validate item fields -----------------------------------------------

    for (const item of items) {
      if (!item.productId || typeof item.productId !== 'string') {
        return NextResponse.json({ success: false, error: 'Each item must have a valid productId.' }, { status: 400 })
      }
      if (!Number.isFinite(item.quantity) || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        return NextResponse.json({ success: false, error: `Invalid quantity for product ${item.productId}.` }, { status: 400 })
      }
      if (!Number.isFinite(item.price) || item.price < 0) {
        return NextResponse.json({ success: false, error: `Invalid price for product ${item.productId}.` }, { status: 400 })
      }
    }

    // ---- Server-side price calculation from Sanity --------------------------

    const productIds = items.map((item: any) => item.productId)
    const priceQuery = `*[_type == "product" && _id in $ids] { _id, price, hasDiscount, discountedPrice }`
    const products = await serverClient.fetch<Array<{ _id: string; price: number; hasDiscount?: boolean; discountedPrice?: number }>>(priceQuery, { ids: productIds })
    const priceMap = new Map(products.map((p) => [p._id, p]))

    let computedSubtotal = 0
    const verifiedItems = items.map((item: any) => {
      const product = priceMap.get(item.productId)
      // Use the canonical price from Sanity, not from the client
      const unitPrice = product
        ? (product.hasDiscount && product.discountedPrice ? product.discountedPrice : product.price)
        : item.price // fallback if product was somehow deleted between validation
      computedSubtotal += unitPrice * item.quantity
      return { ...item, price: unitPrice }
    })

    const discount = Math.max(0, Math.min(promoDiscount, computedSubtotal)) // clamp discount
    const computedTotal = Math.round((computedSubtotal - discount) * 100) / 100

    // ---- Stock check --------------------------------------------------------

    const stockValidation = await validateOrderStock(
      verifiedItems.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
      }))
    )

    if (!stockValidation.valid) {
      return NextResponse.json(
        { success: false, error: 'Some items are out of stock.', stockErrors: stockValidation.errors },
        { status: 400 }
      )
    }

    // ---- Find or create customer record ------------------------------------

    const { user: customerUser } = await findOrCreateCustomer({
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      address: shippingAddress?.city || shippingAddress?.street
        ? {
            street: shippingAddress?.street,
            city: shippingAddress?.city,
            region: shippingAddress?.region,
            country: shippingAddress?.country,
          }
        : undefined,
    }).catch((err) => {
      // Customer creation is non-critical: the order stores guest customer
      // fields (customerEmail, customerFirstName, etc.) independently and
      // syncOrderToDb will still attempt to link by email if the user is
      // eventually created later.  We log the failure and continue.
      console.error('[orders/create] findOrCreateCustomer failed:', err)
      return { user: null, created: false }
    })

    // ---- Create order doc ---------------------------------------------------

    const orderDoc = {
      _id: orderId,
      _type: 'order',
      orderId,
      orderDate: new Date().toISOString(),
      status: 'pending_payment',
      paymentStatus: 'pending',
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
      },
      shippingAddress: {
        city: shippingAddress?.city || '',
        landmark: shippingAddress?.landmark || '',
      },
      items: verifiedItems,
      subtotal: computedSubtotal,
      discount,
      promoCode: promoCode || undefined,
      shippingCost: 0,
      tax: 0,
      total: computedTotal,
      paymentProvider: provider,
      metadata: {
        provider,
      },
    }

    await serverClient.create(orderDoc)

    // Sync to Postgres (fire-and-forget, non-blocking)
    syncOrderToDb({
      sanityId: orderId,
      orderId,
      orderDate: orderDoc.orderDate,
      status: orderDoc.status,
      paymentStatus: orderDoc.paymentStatus,
      paymentProvider: provider,
      customer: orderDoc.customer,
      shippingAddress: orderDoc.shippingAddress,
      items: verifiedItems,
      subtotal: computedSubtotal,
      discount,
      shippingCost: 0,
      tax: 0,
      total: computedTotal,
      promoCode: promoCode || undefined,
      metadata: { provider },
    }).catch((e) => console.error('[orders/create] DB sync failed:', e))

    return NextResponse.json({ success: true, orderId, total: computedTotal, subtotal: computedSubtotal })
  } catch (error) {
    console.error('[orders/create] error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create order'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
