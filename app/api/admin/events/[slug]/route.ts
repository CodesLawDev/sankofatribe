import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/auth-utils'
import { serverClient } from '@/lib/sanity-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const prisma = getPrisma()

    // Get event from Sanity
    const eventQuery = `*[_type == "event" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      eventDate,
      venue,
      address,
      city,
      "imageUrl": image.asset->url
    }`
    const event = await serverClient.fetch(eventQuery, { slug: params.slug })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Get tickets for this specific event
    const tickets = await prisma.eventTicket.findMany({ 
      where: { eventId: event._id },
      orderBy: { createdAt: 'desc' }, 
      include: {
        order: {
          include: {
            tier: true
          }
        }
      },
      take: 20
    })

    // Map tickets to include attendeeName from order
    const ticketsWithAttendee = tickets.map(ticket => ({
      ...ticket,
      attendeeName: ticket.order?.buyerName || ticket.order?.buyerEmail || 'Unknown'
    }))

    // Get stats
    const [totalTickets, usedTickets, pendingTickets] = await Promise.all([
      prisma.eventTicket.count({ where: { eventId: event._id } }),
      prisma.eventTicket.count({ where: { eventId: event._id, status: 'USED' } }),
      prisma.eventTicket.count({ where: { eventId: event._id, status: 'AVAILABLE' } }),
    ])

    return NextResponse.json({
      event,
      tickets: ticketsWithAttendee,
      stats: {
        totalTickets,
        usedTickets,
        pendingTickets
      }
    })
  } catch (error) {
    console.error('Failed to fetch event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}
