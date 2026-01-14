import { getPrisma } from '@/lib/auth-utils'
import { serverClient } from '@/lib/sanity-server'
import TicketVerifier from '@/components/admin/ticket-verifier'
import AttendeeList from '@/components/admin/attendee-list'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin } from 'lucide-react'
import { notFound } from 'next/navigation'

interface VerifyEventPageProps {
  params: {
    slug: string
  }
}

export default async function VerifyEventPage({ params }: VerifyEventPageProps) {
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
    notFound()
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

  // Get stats
  const [totalTickets, usedTickets, pendingTickets] = await Promise.all([
    prisma.eventTicket.count({ where: { eventId: event._id } }),
    prisma.eventTicket.count({ where: { eventId: event._id, status: 'USED' } }),
    prisma.eventTicket.count({ where: { eventId: event._id, status: 'AVAILABLE' } }),
  ])

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Back Button */}
        <Link 
          href="/verify" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>

        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {event.imageUrl && (
            <div className="h-48 overflow-hidden">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{new Date(event.eventDate).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}</span>
              </div>
              {event.venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{event.venue}{event.address ? `, ${event.address}` : ''}{event.city ? `, ${event.city}` : ''}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{totalTickets}</div>
                <div className="text-sm text-gray-600">Total Tickets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{usedTickets}</div>
                <div className="text-sm text-gray-600">Checked In</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{pendingTickets}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Verifier */}
        <TicketVerifier eventId={event._id} />

        {/* Recent Activity */}
        <AttendeeList tickets={tickets} eventId={event._id} />
      </div>
    </div>
  )
}
