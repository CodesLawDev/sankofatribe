import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/auth-utils'
import { serverClient } from '@/lib/sanity-server'

export async function GET(request: NextRequest) {
  try {
    const prisma = getPrisma()

    // Get all events from Sanity
    const eventsQuery = `*[_type == "event"] | order(eventDate desc) {
      _id,
      title,
      slug,
      eventDate,
      venue,
      city,
      "imageUrl": image.asset->url
    }`
    const events = await serverClient.fetch(eventsQuery)

    // Get ticket counts for each event from database
    const eventStats = await Promise.all(
      events.map(async (event: any) => {
        const [totalTickets, usedTickets] = await Promise.all([
          prisma.eventTicket.count({ where: { eventId: event._id } }),
          prisma.eventTicket.count({ where: { eventId: event._id, status: 'USED' } }),
        ])
        return { eventId: event._id, totalTickets, usedTickets }
      })
    )

    const eventsWithStats = events.map((event: any) => {
      const stats = eventStats.find((s) => s.eventId === event._id)
      return { ...event, ...stats }
    })

    return NextResponse.json({ events: eventsWithStats })
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
