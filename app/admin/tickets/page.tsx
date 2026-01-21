import { PrismaClient } from '@prisma/client'
import TicketVerifier from '@/components/admin/ticket-verifier'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export default async function AdminTicketsPage() {
  type OrdersResult = Awaited<ReturnType<typeof prisma.eventTicketOrder.findMany>>
  type TicketsResult = Awaited<ReturnType<typeof prisma.eventTicket.findMany>>

  let orders: OrdersResult = []
  let tickets: TicketsResult = []

  try {
    ;[orders, tickets] = await Promise.all([
      prisma.eventTicketOrder.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.eventTicket.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    ])
  } catch (error) {
    console.error('Admin tickets page data fetch failed:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin • Ticketing</h1>
          <p className="text-gray-600">Review orders and tickets, and verify QR entries.</p>
        </div>

        <TicketVerifier />

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-700">
                    <th className="py-2 pr-4">Order ID</th>
                    <th className="py-2 pr-4">Buyer</th>
                    <th className="py-2 pr-4">Tickets</th>
                    <th className="py-2 pr-4">Total</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t border-gray-100">
                      <td className="py-2 pr-4 font-mono text-xs text-gray-900">{o.orderId}</td>
                      <td className="py-2 pr-4 text-gray-900">{o.buyerName}</td>
                      <td className="py-2 pr-4 text-gray-900">{o.ticketCount}</td>
                      <td className="py-2 pr-4 text-gray-900">{o.currency} {o.totalAmount.toFixed(2)}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${o.paymentStatus === 'success' ? 'bg-green-100 text-green-800' : o.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{o.paymentStatus}</span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-3 text-gray-500">No recent orders</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Tickets</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-700">
                    <th className="py-2 pr-4">Ticket ID</th>
                    <th className="py-2 pr-4">Attendee</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Used At</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id} className="border-t border-gray-100">
                      <td className="py-2 pr-4 font-mono text-xs text-gray-900">{t.ticketId}</td>
                      <td className="py-2 pr-4 text-gray-900">{t.attendeeName}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${t.status === 'USED' ? 'bg-yellow-100 text-yellow-800' : t.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{t.status}</span>
                      </td>
                      <td className="py-2 pr-4 text-gray-900">{t.usedAt ? new Date(t.usedAt).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                  {tickets.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-3 text-gray-500">No recent tickets</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
