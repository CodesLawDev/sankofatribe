import { NextRequest, NextResponse } from 'next/server'
import { syncProductToDb, syncOrderToDb } from '@/lib/sync-to-db'
import crypto from 'crypto'

// =============================================================================
// Sanity Webhook Handler
//
// Receives real-time document mutations from Sanity and syncs to Postgres.
// Configured via Sanity Management API with GROQ projection.
//
// Webhook URL:  https://sankofatribe.com/api/webhooks/sanity
// Trigger:      Create, Update, Delete
// Filter:       _type in ["product", "order", "event"]
// Projection:   Full document (all fields)
// =============================================================================

function verifySanitySignature(body: string, signature: string | null, secret: string): boolean {
  if (!signature) return false

  // Sanity sends: t=<timestamp>,v1=<hmac-sha256>
  const parts = signature.split(',')
  const timestampPart = parts.find((p) => p.startsWith('t='))
  const sigPart = parts.find((p) => p.startsWith('v1='))

  if (!timestampPart || !sigPart) return false

  const timestamp = timestampPart.slice(2)
  const receivedSig = sigPart.slice(3)

  // The signed content is "timestamp.body"
  const signedContent = `${timestamp}.${body}`
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(signedContent)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(receivedSig, 'hex'),
    Buffer.from(expectedSig, 'hex')
  )
}

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text()

    // --- Signature verification -----------------------------------------------
    const secret = process.env.SANITY_WEBHOOK_SECRET
    if (secret) {
      const signature = req.headers.get('sanity-webhook-signature')
      if (!verifySanitySignature(bodyText, signature, secret)) {
        console.warn('[webhook/sanity] Invalid signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const body = JSON.parse(bodyText)

    const { _type, _id } = body || {}

    if (!_type || !_id) {
      return NextResponse.json({ error: 'Missing _type or _id' }, { status: 400 })
    }

    // --- Route by document type ------------------------------------------------

    switch (_type) {
      case 'product': {
        await syncProductToDb({
          sanityId:      _id,
          slug:          body.slug?.current,
          name:          body.name || 'Untitled',
          price:         body.price || 0,
          hasDiscount:   body.hasDiscount ?? false,
          discountType:  body.discountType ?? null,
          discountValue: body.discountValue ?? null,
          inStock:       body.inStock ?? true,
          featured:      body.featured ?? false,
          soldCount:     body.soldCount ?? 0,
          audience:      body.audience ?? null,
        })
        break
      }

      case 'order': {
        await syncOrderToDb({
          sanityId:        _id,
          orderId:         body.orderId || _id,
          orderDate:       body.orderDate,
          status:          body.status,
          paymentStatus:   body.paymentStatus,
          paymentReference: body.paymentReference,
          paymentProvider:  body.paymentProvider,
          customer:        body.customer,
          shippingAddress:  body.shippingAddress,
          items:           body.items,
          subtotal:        body.subtotal,
          discount:        body.discount,
          shippingCost:    body.shippingCost,
          tax:             body.tax,
          total:           body.total,
          promoCode:       body.promoCode,
          metadata:        body.metadata,
        })
        break
      }

      case 'event': {
        // Re-use the existing EventRecord upsert logic
        const { getPrisma } = await import('@/lib/auth-utils')
        const prisma = getPrisma()
        await prisma.eventRecord.upsert({
          where: { sanityId: _id },
          create: {
            sanityId:    _id,
            slug:        body.slug?.current ?? null,
            title:       body.title || 'Untitled Event',
            eventDate:   body.date ? new Date(body.date) : new Date(),
            endDate:     body.endDate ? new Date(body.endDate) : null,
            venue:       body.venue ?? null,
            address:     body.address ?? null,
            city:        body.city ?? null,
            isVirtual:   body.isVirtual ?? false,
            virtualLink: body.virtualLink ?? null,
            status:      body.status ?? 'upcoming',
            featured:    body.featured ?? false,
          },
          update: {
            slug:        body.slug?.current ?? undefined,
            title:       body.title || 'Untitled Event',
            eventDate:   body.date ? new Date(body.date) : undefined,
            endDate:     body.endDate ? new Date(body.endDate) : null,
            venue:       body.venue ?? null,
            address:     body.address ?? null,
            city:        body.city ?? null,
            isVirtual:   body.isVirtual ?? false,
            virtualLink: body.virtualLink ?? null,
            status:      body.status ?? 'upcoming',
            featured:    body.featured ?? false,
          },
        })
        console.log(`[webhook/sanity] Event ${_id} synced to DB`)
        break
      }

      default:
        console.log(`[webhook/sanity] Ignoring type: ${_type}`)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[webhook/sanity] Error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
