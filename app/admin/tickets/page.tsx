import Link from 'next/link'
import { PrismaClient } from '@prisma/client'
import TicketVerifier from '@/components/admin/ticket-verifier'
import AttendeeList from '@/components/admin/attendee-list'
import OrdersTable from '@/components/admin/orders-table'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

const formatCurrency = (amount: number | null | undefined, currency = 'GHS') => {
  const value = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0
  return `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const formatDate = (value: Date | string | null | undefined) => {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type SearchParams = { eventId?: string }

export default async function AdminTicketsPage({ searchParams }: { searchParams?: SearchParams }) {
  type EventRecordResult = Awaited<ReturnType<typeof prisma.eventRecord.findMany>>
  type TierResult = Awaited<ReturnType<typeof prisma.eventTicketTier.findMany>>
  type OrderWithTier = Awaited<ReturnType<typeof prisma.eventTicketOrder.findMany<{ include: { tier: true } }>>>
  type TicketWithOrder = Awaited<ReturnType<typeof prisma.eventTicket.findMany<{ include: { order: { include: { tier: true } } } }>>>

  let events: EventRecordResult = []
  const requestedEventId = typeof searchParams?.eventId === 'string' ? searchParams.eventId : undefined

  try {
    events = await prisma.eventRecord.findMany({ orderBy: { eventDate: 'desc' } })
  } catch (error) {
    console.error('Failed to load event records:', error)
  }

  const activeEvent = events.find((ev) => ev.sanityId === requestedEventId) || events[0] || null
  const eventId = activeEvent?.sanityId

  const [totalOrders, revenueAgg, totalTickets, totalScanned] = await Promise.all([
    prisma.eventTicketOrder.count().catch(() => 0),
    prisma.eventTicketOrder
      .aggregate({ where: { paymentStatus: 'success' }, _sum: { totalAmount: true } })
      .catch(() => ({ _sum: { totalAmount: 0 } })),
    prisma.eventTicket.count().catch(() => 0),
    prisma.eventTicket.count({ where: { status: 'USED' } }).catch(() => 0),
  ])

  let tiers: TierResult = []
  let orders: OrderWithTier = []
  let tickets: TicketWithOrder = []
  let eventRevenue = 0
  let usedCount = 0
  let availableCount = 0
  let cancelledCount = 0

  if (eventId) {
    try {
      const [tierResult, orderResult, ticketResult, eventRevenueAgg, used, available, cancelled] = await Promise.all([
        prisma.eventTicketTier.findMany({ where: { eventId }, orderBy: { price: 'asc' } }),
        prisma.eventTicketOrder.findMany({
          where: { eventId },
          orderBy: { createdAt: 'desc' },
          take: 30,
          include: { tier: true },
        }),
        prisma.eventTicket.findMany({
          where: { eventId },
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { order: { include: { tier: true } } },
        }),
        prisma.eventTicketOrder.aggregate({
          where: { eventId, paymentStatus: 'success' },
          _sum: { totalAmount: true },
        }),
        prisma.eventTicket.count({ where: { eventId, status: 'USED' } }),
        prisma.eventTicket.count({ where: { eventId, status: 'AVAILABLE' } }),
        prisma.eventTicket.count({ where: { eventId, status: 'CANCELLED' } }),
      ])

      tiers = tierResult
      orders = orderResult
      tickets = ticketResult
      eventRevenue = eventRevenueAgg._sum.totalAmount ?? 0
      usedCount = used
      availableCount = available
      cancelledCount = cancelled
    } catch (error) {
      console.error('Failed to load event ticketing data:', error)
    }
  }

  const tierCapacity = tiers.reduce((acc, t) => acc + (t.quantity || 0), 0)
  const tierSold = tiers.reduce((acc, t) => acc + (t.sold || 0), 0)
  const tierRemaining = Math.max(tierCapacity - tierSold, 0)
  const sellThrough = tierCapacity ? Math.round((tierSold / tierCapacity) * 100) : 0

  const paymentBreakdown = orders.reduce<Record<string, number>>((acc, order) => {
    const status = order.paymentStatus || 'unknown'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Admin • Ticketing</h1>
          <p className="text-gray-600">Monitor events, revenue, orders, and check-ins.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500 font-semibold">Events</p>
            <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            <p className="text-xs text-gray-500">Synced from Sanity</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500 font-semibold">Ticket Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenueAgg._sum.totalAmount)}</p>
            <p className="text-xs text-gray-500">Completed payments</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500 font-semibold">Tickets Issued</p>
            <p className="text-2xl font-bold text-gray-900">{totalTickets}</p>
            <p className="text-xs text-gray-500">Across all events</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <p className="text-xs uppercase text-gray-500 font-semibold">Checked In</p>
            <p className="text-2xl font-bold text-gray-900">{totalScanned}</p>
            <p className="text-xs text-gray-500">Marked as used</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase text-gray-500 font-semibold">Select Event</p>
              <h2 className="text-lg font-semibold text-gray-900">{activeEvent ? activeEvent.title : 'No events available'}</h2>
              {activeEvent && (
                <p className="text-sm text-gray-600">{formatDate(activeEvent.eventDate)}{activeEvent.city ? ` · ${activeEvent.city}` : ''}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <form className="flex flex-wrap gap-2 items-center" method="get">
                <label className="text-sm text-gray-600" htmlFor="eventId">Event</label>
                <select
                  id="eventId"
                  name="eventId"
                  defaultValue={eventId || ''}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900"
                >
                  {events.map((ev) => (
                    <option key={ev.sanityId} value={ev.sanityId}>
                      {ev.title}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-3 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                >
                  Load
                </button>
              </form>
              {activeEvent?.slug && (
                <Link
                  href={`/events/${activeEvent.slug}`}
                  className="px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100"
                >
                  View live
                </Link>
              )}
              {activeEvent && (
                <Link
                  href="/studio"
                  className="px-3 py-2 text-sm font-medium text-gray-800 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200"
                >
                  Edit in Studio
                </Link>
              )}
            </div>
          </div>

          {eventId ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs uppercase text-gray-500 font-semibold">Event Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(eventRevenue)}</p>
                <p className="text-xs text-gray-500">Paid orders only</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs uppercase text-gray-500 font-semibold">Tickets Sold</p>
                <p className="text-2xl font-bold text-gray-900">{tierSold}</p>
                <p className="text-xs text-gray-500">{sellThrough}% of capacity</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs uppercase text-gray-500 font-semibold">Remaining</p>
                <p className="text-2xl font-bold text-gray-900">{tierRemaining}</p>
                <p className="text-xs text-gray-500">Capacity {tierCapacity || 'N/A'}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs uppercase text-gray-500 font-semibold">Check-ins</p>
                <p className="text-2xl font-bold text-gray-900">{usedCount}</p>
                <p className="text-xs text-gray-500">Available {availableCount} · Cancelled {cancelledCount}</p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">No events available. Publish an event in Sanity first.</div>
          )}
        </div>

        {eventId && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Ticket Tiers</h3>
                    <p className="text-sm text-gray-600">Synced from Sanity ticket tiers.</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{tiers.length} tier(s)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-700">
                        <th className="py-2 pr-4">Tier</th>
                        <th className="py-2 pr-4">Price</th>
                        <th className="py-2 pr-4">Quantity</th>
                        <th className="py-2 pr-4">Sold</th>
                        <th className="py-2 pr-4">Remaining</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tiers.map((tier) => (
                        <tr key={tier.id} className="border-t border-gray-100">
                          <td className="py-2 pr-4 text-gray-900 font-medium">{tier.name}</td>
                          <td className="py-2 pr-4 text-gray-900">{formatCurrency(tier.price)}</td>
                          <td className="py-2 pr-4 text-gray-900">{tier.quantity}</td>
                          <td className="py-2 pr-4 text-gray-900">{tier.sold}</td>
                          <td className="py-2 pr-4 text-gray-900">{Math.max((tier.quantity || 0) - (tier.sold || 0), 0)}</td>
                        </tr>
                      ))}
                      {tiers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-3 text-gray-500">No tiers found for this event.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

                            <OrdersTable 
                orders={orders.map(o => ({
                  id: o.id,
                  orderId: o.orderId,
                  buyerName: o.buyerName,
                  buyerEmail: o.buyerEmail,
                  buyerPhone: o.buyerPhone,
                  ticketCount: o.ticketCount,
                  totalAmount: o.totalAmount,
                  currency: o.currency,
                  paymentStatus: o.paymentStatus,
                  createdAt: o.createdAt.toISOString(),
                  tier: o.tier ? { name: o.tier.name } : null,
                }))}
                paymentBreakdown={paymentBreakdown}
              />
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Attendees</h3>
                <p className="text-sm text-gray-600 mb-4">Tap a row to view, check-in, or revert.</p>
                <AttendeeList tickets={tickets} eventId={eventId} />
              </div>

              <TicketVerifier eventId={eventId} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
