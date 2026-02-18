'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TicketVerifier from '@/components/admin/ticket-verifier'
import AttendeeList from '@/components/admin/attendee-list'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin } from 'lucide-react'

interface VerifyEventPageProps {
  params: {
    slug: string
  }
}

interface EventData {
  _id: string
  title: string
  slug: { current: string }
  eventDate: string
  venue: string
  address?: string
  city: string
  imageUrl?: string
}

interface TicketData {
  id: string
  ticketId: string
  attendeeName: string
  status: string
  createdAt: string
  order: {
    tier: {
      name: string
      price: number
    }
  }
}

interface StatsData {
  totalTickets: number
  usedTickets: number
  pendingTickets: number
}

export default function VerifyEventPage({ params }: VerifyEventPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [event, setEvent] = useState<EventData | null>(null)
  const [tickets, setTickets] = useState<TicketData[]>([])
  const [stats, setStats] = useState<StatsData>({ totalTickets: 0, usedTickets: 0, pendingTickets: 0 })

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' })
        if (!response.ok) {
          router.push('/admin/login')
          return
        }
        const data = await response.json()
        if (data.user.role !== 'ADMIN' && data.user.role !== 'SUPERADMIN') {
          router.push('/admin/login')
          return
        }
        fetchEventData()
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/admin/login')
      }
    }
    checkAuthAndFetch()
  }, [router, params.slug])

  const fetchEventData = async () => {
    try {
      const response = await fetch(`/api/admin/events/${params.slug}`, { credentials: 'include' })
      if (!response.ok) {
        router.push('/verify')
        return
      }
      const data = await response.json()
      setEvent(data.event)
      setTickets(data.tickets || [])
      setStats(data.stats || { totalTickets: 0, usedTickets: 0, pendingTickets: 0 })
    } catch (error) {
      console.error('Failed to fetch event data:', error)
      router.push('/verify')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Event not found</p>
          <Link href="/verify" className="text-blue-600 hover:underline">Back to Events</Link>
        </div>
      </div>
    )
  }
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
                <div className="text-2xl font-bold text-gray-900">{stats.totalTickets}</div>
                <div className="text-sm text-gray-600">Total Tickets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.usedTickets}</div>
                <div className="text-sm text-gray-600">Checked In</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">{stats.pendingTickets}</div>
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
