require('dotenv/config')
const { PrismaClient } = require('@prisma/client')
const { createClient } = require('@sanity/client')

const prisma = new PrismaClient()

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN,
  perspective: 'published',
})

async function run() {
  try {
    const events = await sanity.fetch(`*[_type == "event"]{
      _id,
      title,
      slug,
      eventDate,
      endDate,
      status,
      featured,
      ticketInfo{
        isFree,
        maxCapacity,
        currency,
        ticketTiers[]{
          _key,
          name,
          description,
          price,
          quantity,
          currency
        }
      },
      location{
        venue,
        address,
        city,
        isVirtual,
        virtualLink
      }
    }`)

    for (const ev of events) {
      const slug = ev?.slug?.current || null
      const location = ev?.location || {}
      
      await prisma.eventRecord.upsert({
        where: { sanityId: ev._id },
        update: {
          slug,
          title: ev.title,
          eventDate: new Date(ev.eventDate),
          endDate: ev.endDate ? new Date(ev.endDate) : null,
          status: ev.status || 'upcoming',
          featured: Boolean(ev.featured),
          venue: location.venue || null,
          address: location.address || null,
          city: location.city || null,
          isVirtual: Boolean(location.isVirtual),
          virtualLink: location.virtualLink || null,
        },
        create: {
          sanityId: ev._id,
          slug,
          title: ev.title,
          eventDate: new Date(ev.eventDate),
          endDate: ev.endDate ? new Date(ev.endDate) : null,
          status: ev.status || 'upcoming',
          featured: Boolean(ev.featured),
          venue: location.venue || null,
          address: location.address || null,
          city: location.city || null,
          isVirtual: Boolean(location.isVirtual),
          virtualLink: location.virtualLink || null,
        },
      })

      // Sync ticket tiers
      const ticketInfo = ev?.ticketInfo
      if (ticketInfo?.ticketTiers && Array.isArray(ticketInfo.ticketTiers)) {
        const tiers = ticketInfo.ticketTiers
        
        // Delete existing tiers for this event
        await prisma.eventTicketTier.deleteMany({
          where: { eventId: ev._id }
        })

        // Create new tiers
        for (const tier of tiers) {
          if (!tier?.name) continue
          
          await prisma.eventTicketTier.create({
            data: {
              eventId: ev._id,
              name: tier.name,
              description: tier.description || null,
              price: typeof tier.price === 'number' ? tier.price : 0,
              quantity: typeof tier.quantity === 'number' ? tier.quantity : 0,
              sold: 0,
            }
          })
        }
      }
    }

    console.log(`Backfilled ${events.length} events into EventRecord`)
    process.exit(0)
  } catch (err) {
    console.error('Backfill failed:', err)
    process.exit(1)
  }
}

run()
