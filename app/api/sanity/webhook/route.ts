import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { serverClient } from '@/lib/sanity-server'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const secretHeader = req.headers.get('x-webhook-secret')
  const expectedSecret = process.env.ADMIN_INIT_SECRET || process.env.CRON_SECRET

  if (!expectedSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  if (secretHeader !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await req.json()
    const action = payload?.action || payload?.transition || 'update'
    const rawIds: string[] = (
      payload?.ids?.created ||
      payload?.ids?.updated ||
      payload?.ids?.deleted ||
      payload?.ids ||
      (payload?._id ? [payload._id] : []) ||
      (payload?.id ? [payload.id] : [])
    ) as string[]

    const ids = Array.isArray(rawIds) ? rawIds : []
    if (ids.length === 0) {
      return NextResponse.json({ ignored: true }, { status: 200 })
    }

    // Process multiple ids if present
    const results: any[] = []
    for (const id of ids) {
      if (action === 'delete') {
        await prisma.eventRecord.deleteMany({ where: { sanityId: id } })
        results.push({ id, action: 'delete' })
        continue
      }

      // Fetch fresh event from Sanity to ensure we have the published state
      const query = `*[_type == "event" && _id == $id][0]{
      _id,
      title,
      slug,
      eventDate,
      endDate,
      status,
      featured,
      location{
        venue,
        address,
        city,
        isVirtual,
        virtualLink
      }
    }`
      const event = await serverClient.fetch<any>(query, { id })

      if (!event) {
        // If not found (e.g., draft/unpublished), remove any existing record
        await prisma.eventRecord.deleteMany({ where: { sanityId: id } })
        results.push({ id, action: 'unpublished' })
        continue
      }

      const slug = event?.slug?.current || null
      const location = event?.location || {}

      await prisma.eventRecord.upsert({
        where: { sanityId: event._id },
        update: {
          slug,
          title: event.title,
          eventDate: new Date(event.eventDate),
          endDate: event.endDate ? new Date(event.endDate) : null,
          status: event.status || 'upcoming',
          featured: Boolean(event.featured),
          venue: location.venue || null,
          address: location.address || null,
          city: location.city || null,
          isVirtual: Boolean(location.isVirtual),
          virtualLink: location.virtualLink || null,
        },
        create: {
          sanityId: event._id,
          slug,
          title: event.title,
          eventDate: new Date(event.eventDate),
          endDate: event.endDate ? new Date(event.endDate) : null,
          status: event.status || 'upcoming',
          featured: Boolean(event.featured),
          venue: location.venue || null,
          address: location.address || null,
          city: location.city || null,
          isVirtual: Boolean(location.isVirtual),
          virtualLink: location.virtualLink || null,
        },
      })
      // Mirror ticket tiers into EventTicketTier
      const tiers: Array<any> = event?.ticketInfo?.ticketTiers || []
      for (const t of tiers) {
        const name = t?.name
        if (!name) continue
        const price = typeof t?.price === 'number' ? t.price : 0
        const quantity = typeof t?.quantity === 'number' ? t.quantity : 0

        const existingTier = await prisma.eventTicketTier.findFirst({
          where: { eventId: event._id, name }
        })
        if (existingTier) {
          // Update price and quantity; preserve sold count
          await prisma.eventTicketTier.update({
            where: { id: existingTier.id },
            data: {
              price,
              quantity,
            }
          })
        } else {
          await prisma.eventTicketTier.create({
            data: {
              eventId: event._id,
              name,
              description: t?.description || null,
              price,
              quantity,
              sold: 0,
            }
          })
        }
      }
      results.push({ id, action: 'upsert' })
    }

    return NextResponse.json({ success: true, results })
  } catch (err) {
    console.error('Sanity webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
