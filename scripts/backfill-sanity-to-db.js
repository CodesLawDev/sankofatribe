#!/usr/bin/env node
// =============================================================================
// backfill-sanity-to-db.js
//
// One-off script that pulls ALL orders, payments, products, and events from
// Sanity and upserts them into the Postgres database.
//
// Usage:  node scripts/backfill-sanity-to-db.js
//         node scripts/backfill-sanity-to-db.js --type=orders
//         node scripts/backfill-sanity-to-db.js --type=products
//         node scripts/backfill-sanity-to-db.js --type=events
//         node scripts/backfill-sanity-to-db.js --type=all   (default)
// =============================================================================

const { PrismaClient } = require('@prisma/client')
const { createClient } = require('@sanity/client')

const prisma = new PrismaClient()

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

// ---------------------------------------------------------------------------
// Status mapping (matches lib/sync-to-db.ts)
// ---------------------------------------------------------------------------

const STATUS_MAP = {
  pending_payment: 'PENDING',
  processing:      'PROCESSING',
  shipped:         'SHIPPED',
  completed:       'DELIVERED',
  cancelled:       'CANCELLED',
}

function mapStatus(s) {
  return STATUS_MAP[s] || 'PENDING'
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

async function backfillOrders() {
  console.log('\n--- Syncing Orders ---')
  const orders = await sanity.fetch(`*[_type == "order"] {
    _id,
    orderId,
    orderDate,
    status,
    paymentStatus,
    paymentReference,
    paymentProvider,
    customer,
    shippingAddress,
    items[] {
      productId,
      name,
      price,
      quantity,
      size
    },
    subtotal,
    discount,
    shippingCost,
    tax,
    total,
    promoCode,
    metadata
  }`)

  console.log(`  Found ${orders.length} orders in Sanity`)
  let synced = 0
  let errors = 0

  for (const o of orders) {
    try {
      // Look up user by email
      let userId = null
      if (o.customer?.email) {
        const user = await prisma.user.findUnique({
          where: { email: o.customer.email },
          select: { id: true },
        })
        if (user) userId = user.id
      }

      const orderData = {
        sanityId:          o._id,
        orderNumber:       o.orderId || o._id,
        userId:            userId,
        subtotal:          o.subtotal ?? 0,
        discount:          o.discount ?? 0,
        shipping:          o.shippingCost ?? 0,
        tax:               o.tax ?? 0,
        total:             o.total ?? 0,
        promoCode:         o.promoCode || null,
        status:            mapStatus(o.status),
        paymentStatus:     o.paymentStatus || 'pending',
        paymentReference:  o.paymentReference || null,
        paymentProvider:   o.paymentProvider || o.metadata?.provider || null,
        paymentMethod:     o.metadata?.paymentMethod || null,
        paidAt:            o.metadata?.paidAt ? new Date(o.metadata.paidAt) : null,
        customerEmail:     o.customer?.email  || null,
        customerPhone:     o.customer?.phone  || null,
        customerFirstName: o.customer?.firstName || null,
        customerLastName:  o.customer?.lastName  || null,
        shippingCity:      o.shippingAddress?.city || null,
        shippingLandmark:  o.shippingAddress?.landmark || null,
        createdAt:         o.orderDate ? new Date(o.orderDate) : new Date(),
      }

      const order = await prisma.order.upsert({
        where: { sanityId: o._id },
        create: orderData,
        update: {
          status:           orderData.status,
          paymentStatus:    orderData.paymentStatus,
          paymentReference: orderData.paymentReference,
          paymentProvider:  orderData.paymentProvider,
          paymentMethod:    orderData.paymentMethod,
          paidAt:           orderData.paidAt,
          userId:           userId || undefined,
          subtotal:         orderData.subtotal,
          discount:         orderData.discount,
          total:            orderData.total,
          promoCode:        orderData.promoCode,
        },
      })

      // Sync items
      if (o.items?.length) {
        await prisma.orderItem.deleteMany({ where: { orderId: order.id } })
        await prisma.orderItem.createMany({
          data: o.items.map((item) => ({
            orderId:     order.id,
            productId:   item.productId || 'unknown',
            productName: item.name || 'Unknown Product',
            price:       item.price || 0,
            quantity:    item.quantity || 1,
            size:        item.size || null,
          })),
        })
      }

      synced++
    } catch (err) {
      errors++
      console.error(`  ✗ Order ${o._id}:`, err.message)
    }
  }

  console.log(`  ✓ Synced ${synced} orders, ${errors} errors`)
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

async function backfillPayments() {
  console.log('\n--- Syncing Payments ---')
  const payments = await sanity.fetch(`*[_type == "payment"] {
    _id,
    reference,
    orderId->{_id},
    amount,
    currency,
    status,
    provider,
    paymentMethod,
    customerEmail,
    customerPhone,
    paidAt,
    verifiedAt
  }`)

  console.log(`  Found ${payments.length} payments in Sanity`)
  let synced = 0
  let errors = 0

  for (const p of payments) {
    try {
      if (!p.reference) {
        console.warn(`  ⚠ Payment ${p._id} has no reference, skipping`)
        continue
      }

      const sanityOrderId = p.orderId?._id
      if (!sanityOrderId) {
        console.warn(`  ⚠ Payment ${p.reference} has no linked order, skipping`)
        continue
      }

      // Find the Prisma order by sanityId
      const order = await prisma.order.findUnique({
        where: { sanityId: sanityOrderId },
        select: { id: true },
      })

      if (!order) {
        console.warn(`  ⚠ Payment ${p.reference}: no DB order for sanityId ${sanityOrderId}`)
        continue
      }

      await prisma.payment.upsert({
        where: { reference: p.reference },
        create: {
          sanityId:      p._id,
          reference:     p.reference,
          orderId:       order.id,
          amount:        p.amount || 0,
          currency:      p.currency || 'GHS',
          status:        p.status || 'success',
          provider:      p.provider || null,
          paymentMethod: p.paymentMethod || null,
          customerEmail: p.customerEmail || null,
          customerPhone: p.customerPhone || null,
          paidAt:        p.paidAt ? new Date(p.paidAt) : null,
          verifiedAt:    p.verifiedAt ? new Date(p.verifiedAt) : null,
        },
        update: {
          status:        p.status || 'success',
          provider:      p.provider || null,
          paymentMethod: p.paymentMethod || null,
          paidAt:        p.paidAt ? new Date(p.paidAt) : null,
          verifiedAt:    p.verifiedAt ? new Date(p.verifiedAt) : null,
        },
      })

      synced++
    } catch (err) {
      errors++
      console.error(`  ✗ Payment ${p.reference || p._id}:`, err.message)
    }
  }

  console.log(`  ✓ Synced ${synced} payments, ${errors} errors`)
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

async function backfillProducts() {
  console.log('\n--- Syncing Products ---')
  const products = await sanity.fetch(`*[_type == "product"] {
    _id,
    name,
    "slug": slug.current,
    price,
    hasDiscount,
    discountType,
    discountValue,
    inStock,
    featured,
    soldCount,
    audience
  }`)

  console.log(`  Found ${products.length} products in Sanity`)
  let synced = 0
  let errors = 0

  for (const p of products) {
    try {
      await prisma.productRecord.upsert({
        where: { sanityId: p._id },
        create: {
          sanityId:      p._id,
          slug:          p.slug || null,
          name:          p.name || 'Untitled',
          price:         p.price || 0,
          hasDiscount:   p.hasDiscount ?? false,
          discountType:  p.discountType || null,
          discountValue: p.discountValue || null,
          inStock:       p.inStock ?? true,
          featured:      p.featured ?? false,
          soldCount:     p.soldCount ?? 0,
          audience:      p.audience || null,
        },
        update: {
          slug:          p.slug || null,
          name:          p.name || 'Untitled',
          price:         p.price || 0,
          hasDiscount:   p.hasDiscount ?? false,
          discountType:  p.discountType || null,
          discountValue: p.discountValue || null,
          inStock:       p.inStock ?? true,
          featured:      p.featured ?? false,
          soldCount:     p.soldCount ?? 0,
          audience:      p.audience || null,
        },
      })

      synced++
    } catch (err) {
      errors++
      console.error(`  ✗ Product ${p._id}:`, err.message)
    }
  }

  console.log(`  ✓ Synced ${synced} products, ${errors} errors`)
}

// ---------------------------------------------------------------------------
// Events (re-uses EventRecord model)
// ---------------------------------------------------------------------------

async function backfillEvents() {
  console.log('\n--- Syncing Events ---')
  const events = await sanity.fetch(`*[_type == "event"] {
    _id,
    title,
    "slug": slug.current,
    date,
    endDate,
    venue,
    address,
    city,
    isVirtual,
    virtualLink,
    status,
    featured
  }`)

  console.log(`  Found ${events.length} events in Sanity`)
  let synced = 0
  let errors = 0

  for (const e of events) {
    try {
      await prisma.eventRecord.upsert({
        where: { sanityId: e._id },
        create: {
          sanityId:    e._id,
          slug:        e.slug || null,
          title:       e.title || 'Untitled Event',
          eventDate:   e.date ? new Date(e.date) : new Date(),
          endDate:     e.endDate ? new Date(e.endDate) : null,
          venue:       e.venue || null,
          address:     e.address || null,
          city:        e.city || null,
          isVirtual:   e.isVirtual ?? false,
          virtualLink: e.virtualLink || null,
          status:      e.status || 'upcoming',
          featured:    e.featured ?? false,
        },
        update: {
          slug:        e.slug || null,
          title:       e.title || 'Untitled Event',
          eventDate:   e.date ? new Date(e.date) : undefined,
          endDate:     e.endDate ? new Date(e.endDate) : null,
          venue:       e.venue || null,
          address:     e.address || null,
          city:        e.city || null,
          isVirtual:   e.isVirtual ?? false,
          virtualLink: e.virtualLink || null,
          status:      e.status || 'upcoming',
          featured:    e.featured ?? false,
        },
      })

      synced++
    } catch (err) {
      errors++
      console.error(`  ✗ Event ${e._id}:`, err.message)
    }
  }

  console.log(`  ✓ Synced ${synced} events, ${errors} errors`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const typeArg = process.argv.find(a => a.startsWith('--type='))
  const type = typeArg ? typeArg.split('=')[1] : 'all'

  console.log(`\n🔄 Backfilling Sanity → Postgres (type: ${type})\n`)

  if (type === 'all' || type === 'orders')   await backfillOrders()
  if (type === 'all' || type === 'payments') await backfillPayments()
  if (type === 'all' || type === 'products') await backfillProducts()
  if (type === 'all' || type === 'events')   await backfillEvents()

  console.log('\n✅ Backfill complete\n')
}

main()
  .catch((err) => {
    console.error('Backfill failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
