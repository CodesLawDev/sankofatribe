'use client'

import { useState, useEffect, useCallback } from 'react'
import { Package, AlertCircle, ChevronRight } from 'lucide-react'

interface OrderItem {
  id: string
  productName: string
  price: number
  quantity: number
  size: string | null
  color: string | null
}

interface Order {
  id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
  items: OrderItem[]
}

interface OrdersResponse {
  data: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pending' },
  CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Confirmed' },
  PROCESSING: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Processing' },
  SHIPPED: { bg: 'bg-cyan-50', text: 'text-cyan-700', label: 'Shipped' },
  DELIVERED: { bg: 'bg-green-50', text: 'text-green-700', label: 'Delivered' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelled' },
  REFUNDED: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Refunded' },
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/customer/orders?page=${pagination.page}&limit=10`)
      if (!response.ok) throw new Error('Failed to fetch orders')
      const data: OrdersResponse = await response.json()
      setOrders(data.data)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.length > 0 ? (
        <>
          {orders.map((order) => {
            const statusInfo = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING
            const isExpanded = expandedOrder === order.id

            return (
              <div
                key={order.id}
                className="bg-white border border-gray-100 rounded-lg overflow-hidden"
              >
                {/* Order Header */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${statusInfo.bg}`}>
                      <Package className={`w-6 h-6 ${statusInfo.text}`} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Order #{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">GH₵{Number(order.total).toFixed(2)}</p>
                      <p className={`text-sm font-medium ${statusInfo.text}`}>
                        {statusInfo.label}
                      </p>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Order Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-6 bg-gray-50 space-y-6">
                    {/* Items */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-2 border-b border-gray-200"
                          >
                            <div>
                              <p className="text-gray-900">{item.productName}</p>
                              <p className="text-sm text-gray-600">
                                Qty: {item.quantity}
                                {item.size && ` | Size: ${item.size}`}
                                {item.color && ` | Color: ${item.color}`}
                              </p>
                            </div>
                            <p className="font-medium text-gray-900">
                              GH₵{Number(item.price).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="text-gray-900">GH₵{Number(order.total).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors">
                        Track Order
                      </button>
                      <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between py-4">
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
                }
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page: Math.min(prev.pages, prev.page + 1),
                  }))
                }
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No orders yet</p>
          <p className="text-sm text-gray-500">Start shopping to see your orders here</p>
        </div>
      )}
    </div>
  )
}
