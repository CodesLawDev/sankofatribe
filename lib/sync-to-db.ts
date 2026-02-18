import { getPrisma } from '@/lib/auth-utils'
import type { OrderStatus } from '@prisma/client'

// =============================================================================
// Sanity → Postgres sync helpers
//
// Every Sanity mutation that creates or updates transactional data (orders,
// payments, products) should call the appropriate helper so that Postgres
// always mirrors the Sanity state.  All functions are idempotent; duplicates
// are handled via upsert on the sanityId / orderNumber / reference.
// =============================================================================

// ---------------------------------------------------------------------------
// Status mapping
// ---------------------------------------------------------------------------

const SANITY_TO_PRISMA_STATUS: Record<string, OrderStatus> = {
  pending_payment: 'PENDING',
  processing:      'PROCESSING',
  shipped:         'SHIPPED',
  completed:       'DELIVERED',
  cancelled:       'CANCELLED',
}

function mapOrderStatus(sanityStatus: string): OrderStatus {
  return SANITY_TO_PRISMA_STATUS[sanityStatus] || 'PENDING'
}

// ---------------------------------------------------------------------------
// 1. Sync an order (upsert)
// ---------------------------------------------------------------------------

export interface SyncOrderData {
  /** Sanity document _id (e.g. ORD-xxx) */
  sanityId: string
  orderId: string
  orderDate?: string
  status?: string
  paymentStatus?: string
  paymentReference?: string
  paymentProvider?: string
  customer?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  }
  shippingAddress?: {
    city?: string
    landmark?: string
  }
  items?: Array<{
    productId: string
    name?: string
    price: number
    quantity: number
    size?: string
    image?: string
  }>
  subtotal?: number
  discount?: number
  shippingCost?: number
  tax?: number
  total?: number
  promoCode?: string
  metadata?: {
    paymentMethod?: string
    provider?: string
    paidAt?: string
  }
}

export async function syncOrderToDb(data: SyncOrderData): Promise<void> {
  const prisma = getPrisma()

  try {
    // Try to find a registered user by email
    let userId: string | null = null
    if (data.customer?.email) {
      const user = await prisma.user.findUnique({
        where: { email: data.customer.email },
        select: { id: true },
      })
      if (user) userId = user.id
    }

    const orderData = {
      sanityId:          data.sanityId,
      orderNumber:       data.orderId,
      userId:            userId,
      subtotal:          data.subtotal ?? 0,
      discount:          data.discount ?? 0,
      shipping:          data.shippingCost ?? 0,
      tax:               data.tax ?? 0,
      total:             data.total ?? 0,
      promoCode:         data.promoCode ?? null,
      status:            mapOrderStatus(data.status || 'pending_payment'),
      paymentStatus:     data.paymentStatus || 'pending',
      paymentReference:  data.paymentReference ?? null,
      paymentProvider:   data.paymentProvider ?? data.metadata?.provider ?? null,
      paymentMethod:     data.metadata?.paymentMethod ?? null,
      paidAt:            data.metadata?.paidAt ? new Date(data.metadata.paidAt) : null,
      customerEmail:     data.customer?.email  ?? null,
      customerPhone:     data.customer?.phone  ?? null,
      customerFirstName: data.customer?.firstName ?? null,
      customerLastName:  data.customer?.lastName  ?? null,
      shippingCity:      data.shippingAddress?.city ?? null,
      shippingLandmark:  data.shippingAddress?.landmark ?? null,
      createdAt:         data.orderDate ? new Date(data.orderDate) : new Date(),
    }

    const order = await prisma.order.upsert({
      where: { sanityId: data.sanityId },
      create: orderData,
      update: {
        // Only update mutable fields (not orderNumber or sanityId)
        status:           orderData.status,
        paymentStatus:    orderData.paymentStatus,
        paymentReference: orderData.paymentReference,
        paymentProvider:  orderData.paymentProvider,
        paymentMethod:    orderData.paymentMethod,
        paidAt:           orderData.paidAt,
        userId:           userId ?? undefined,
        subtotal:         orderData.subtotal,
        discount:         orderData.discount,
        total:            orderData.total,
        promoCode:        orderData.promoCode,
      },
    })

    // Sync order items — delete-and-recreate for simplicity
    if (data.items?.length) {
      await prisma.orderItem.deleteMany({ where: { orderId: order.id } })
      await prisma.orderItem.createMany({
        data: data.items.map((item) => ({
          orderId:     order.id,
          productId:   item.productId,
          productName: item.name || 'Unknown Product',
          price:       item.price,
          quantity:    item.quantity,
          size:        item.size ?? null,
        })),
      })
    }

    console.log(`[sync] Order ${data.orderId} synced to DB (id: ${order.id})`)
  } catch (err) {
    console.error(`[sync] Failed to sync order ${data.orderId} to DB:`, err)
  }
}

// ---------------------------------------------------------------------------
// 2. Update order status/payment (lightweight patch, no items)
// ---------------------------------------------------------------------------

export interface SyncOrderUpdateData {
  sanityId: string
  status?: string
  paymentStatus?: string
  paymentReference?: string
  paymentProvider?: string
  paymentMethod?: string
  paidAt?: string | null
}

export async function syncOrderUpdateToDb(data: SyncOrderUpdateData): Promise<void> {
  const prisma = getPrisma()

  try {
    const updatePayload: Record<string, unknown> = {}
    if (data.status)           updatePayload.status = mapOrderStatus(data.status)
    if (data.paymentStatus)    updatePayload.paymentStatus = data.paymentStatus
    if (data.paymentReference) updatePayload.paymentReference = data.paymentReference
    if (data.paymentProvider)  updatePayload.paymentProvider = data.paymentProvider
    if (data.paymentMethod)    updatePayload.paymentMethod = data.paymentMethod
    if (data.paidAt)           updatePayload.paidAt = new Date(data.paidAt)

    if (Object.keys(updatePayload).length === 0) return

    await prisma.order.update({
      where: { sanityId: data.sanityId },
      data: updatePayload,
    })

    console.log(`[sync] Order ${data.sanityId} status updated in DB`)
  } catch (err) {
    console.error(`[sync] Failed to update order ${data.sanityId} in DB:`, err)
  }
}

// ---------------------------------------------------------------------------
// 3. Sync a payment record
// ---------------------------------------------------------------------------

export interface SyncPaymentData {
  reference: string
  sanityOrderId: string   // Sanity _id of the order (also Order.sanityId)
  amount: number
  currency?: string
  status?: string
  provider?: string
  paymentMethod?: string
  customerEmail?: string
  customerPhone?: string
  paidAt?: string | null
  verifiedAt?: string | null
}

export async function syncPaymentToDb(data: SyncPaymentData): Promise<void> {
  const prisma = getPrisma()

  try {
    // Find the Prisma order by its sanityId
    const order = await prisma.order.findUnique({
      where: { sanityId: data.sanityOrderId },
      select: { id: true },
    })
    if (!order) {
      console.warn(`[sync] Skipping payment sync — no DB order for sanityId ${data.sanityOrderId}`)
      return
    }

    await prisma.payment.upsert({
      where: { reference: data.reference },
      create: {
        reference:     data.reference,
        orderId:       order.id,
        amount:        data.amount,
        currency:      data.currency || 'GHS',
        status:        data.status || 'success',
        provider:      data.provider ?? null,
        paymentMethod: data.paymentMethod ?? null,
        customerEmail: data.customerEmail ?? null,
        customerPhone: data.customerPhone ?? null,
        paidAt:        data.paidAt ? new Date(data.paidAt) : new Date(),
        verifiedAt:    data.verifiedAt ? new Date(data.verifiedAt) : new Date(),
      },
      update: {
        status:        data.status || 'success',
        paidAt:        data.paidAt ? new Date(data.paidAt) : new Date(),
        verifiedAt:    data.verifiedAt ? new Date(data.verifiedAt) : new Date(),
      },
    })

    console.log(`[sync] Payment ${data.reference} synced to DB`)
  } catch (err) {
    console.error(`[sync] Failed to sync payment ${data.reference} to DB:`, err)
  }
}

// ---------------------------------------------------------------------------
// 4. Sync a product record
// ---------------------------------------------------------------------------

export interface SyncProductData {
  sanityId: string
  slug?: string
  name: string
  price: number
  hasDiscount?: boolean
  discountType?: string
  discountValue?: number
  inStock?: boolean
  featured?: boolean
  soldCount?: number
  audience?: string
}

export async function syncProductToDb(data: SyncProductData): Promise<void> {
  const prisma = getPrisma()

  try {
    await prisma.productRecord.upsert({
      where: { sanityId: data.sanityId },
      create: {
        sanityId:      data.sanityId,
        slug:          data.slug ?? null,
        name:          data.name,
        price:         data.price,
        hasDiscount:   data.hasDiscount ?? false,
        discountType:  data.discountType ?? null,
        discountValue: data.discountValue ?? null,
        inStock:       data.inStock ?? true,
        featured:      data.featured ?? false,
        soldCount:     data.soldCount ?? 0,
        audience:      data.audience ?? null,
      },
      update: {
        slug:          data.slug ?? undefined,
        name:          data.name,
        price:         data.price,
        hasDiscount:   data.hasDiscount ?? false,
        discountType:  data.discountType ?? null,
        discountValue: data.discountValue ?? null,
        inStock:       data.inStock ?? true,
        featured:      data.featured ?? false,
        soldCount:     data.soldCount ?? 0,
        audience:      data.audience ?? null,
      },
    })

    console.log(`[sync] Product ${data.name} synced to DB`)
  } catch (err) {
    console.error(`[sync] Failed to sync product ${data.name} to DB:`, err)
  }
}

// ---------------------------------------------------------------------------
// 5. Batch product sync (for backfill / Sanity webhook)
// ---------------------------------------------------------------------------

export async function syncAllProductsToDb(products: SyncProductData[]): Promise<void> {
  for (const product of products) {
    await syncProductToDb(product)
  }
  console.log(`[sync] Batch synced ${products.length} products to DB`)
}
