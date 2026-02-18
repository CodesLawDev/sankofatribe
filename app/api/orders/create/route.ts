import { NextRequest, NextResponse } from 'next/server'
import { serverClient, assertSanityToken, validateOrderStock } from '@/lib/sanity-server'

export async function POST(req: NextRequest) {
  try {
    assertSanityToken()

    const body = await req.json()
    const {
      orderId = `ORD-${Date.now()}`,
      customer,
      shippingAddress,
      items,
      subtotal = 0,
      discount = 0,
      promoCode,
      total = 0,
    } = body || {}

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

    // ---- Stock check --------------------------------------------------------

    const stockValidation = await validateOrderStock(
      items.map((item: any) => ({
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
      items,
      subtotal,
      discount,
      promoCode: promoCode || undefined,
      shippingCost: 0,
      tax: 0,
      total,
      metadata: {},
    }

    await serverClient.createOrReplace(orderDoc)

    return NextResponse.json({ success: true, orderId })
  } catch (error) {
    console.error('[orders/create] error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create order'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
