import { getPrisma } from '@/lib/auth-utils'
import { serverClient } from '@/lib/sanity-server'
import Link from 'next/link'
import { Calendar, MapPin, Users, QrCode } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function VerifyEventsPage() {
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

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ticket Verification</h1>
          <p className="text-gray-600">Select an event to verify attendees and scan tickets</p>
        </div>

        {eventsWithStats.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-600">Create an event in Sanity to start verifying tickets</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventsWithStats.map((event: any) => (
              <Link
                key={event._id}
                href={`/verify/${event.slug.current}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                {event.imageUrl && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{new Date(event.eventDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}</span>
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{event.venue}{event.city ? `, ${event.city}` : ''}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">
                        {event.usedTickets || 0} / {event.totalTickets || 0}
                      </span>
                      <span className="text-gray-500">checked in</span>
                    </div>
                    <QrCode className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
