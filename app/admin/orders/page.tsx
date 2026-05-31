'use client'

import { useState, useEffect } from 'react'
import { Eye, Edit } from 'lucide-react'
import { useAdminAuth } from '@/lib/useAdminAuth'
import AdminPageHeader from '@/components/admin/admin-page-header'
import { AdminFilterBar, AdminSearchInput } from '@/components/admin/admin-button'
import AdminEmptyState from '@/components/admin/admin-empty-state'
import { AdminDataTable, AdminTableHead, AdminTh, AdminTr, AdminTd } from '@/components/admin/admin-section'
import { AdminTableSkeleton } from '@/components/admin/admin-skeleton'
import { adminBadgeClass, adminSelectClass, orderStatusVariant } from '@/lib/admin/utils'

interface Order {
  id: string
  orderNumber: string
  total: number
  status: string
  createdAt: string
  user?: { firstName: string; lastName: string; email: string }
}

export default function AdminOrders() {
  const { user, isLoading: authLoading, isMounted } = useAdminAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    if (isMounted && user && !authLoading) fetchOrders()
  }, [isMounted, user, authLoading])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/orders', { credentials: 'include', cache: 'no-store' })
      if (response.ok) {
        const result = await response.json()
        setOrders(result.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || order.status.toUpperCase() === filterStatus.toUpperCase()
    return matchesSearch && matchesStatus
  })

  return (
    <>
      <AdminPageHeader title="Orders" description="Track and manage customer orders." />

      <AdminFilterBar>
        <AdminSearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search by order ID or email..." />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${adminSelectClass} w-auto min-w-[140px]`}>
          <option value="all">All status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </AdminFilterBar>

      <AdminDataTable>
        {isLoading ? (
          <AdminTableSkeleton rows={8} cols={6} />
        ) : filteredOrders.length === 0 ? (
          <AdminEmptyState title="No orders found" description="Orders will appear here once customers checkout." />
        ) : (
          <table className="min-w-full">
            <AdminTableHead>
              <AdminTh>Order</AdminTh>
              <AdminTh>Customer</AdminTh>
              <AdminTh>Total</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Date</AdminTh>
              <AdminTh>Actions</AdminTh>
            </AdminTableHead>
            <tbody>
              {filteredOrders.map((order) => (
                <AdminTr key={order.id}>
                  <AdminTd>
                    <span className="font-admin-mono font-medium">{order.orderNumber}</span>
                  </AdminTd>
                  <AdminTd className="text-[var(--admin-text-muted)]">
                    {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest'}
                  </AdminTd>
                  <AdminTd>
                    <span className="font-admin-mono">GH₵{Number(order.total).toFixed(2)}</span>
                  </AdminTd>
                  <AdminTd>
                    <span className={adminBadgeClass(orderStatusVariant(order.status))}>{order.status}</span>
                  </AdminTd>
                  <AdminTd className="text-[var(--admin-text-muted)]">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </AdminTd>
                  <AdminTd>
                    <div className="flex gap-1">
                      <button type="button" className="admin-press rounded-lg p-2 text-[var(--admin-text-muted)]" aria-label="View order">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button type="button" className="admin-press rounded-lg p-2 text-[var(--admin-text-muted)]" aria-label="Edit order">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </AdminTd>
                </AdminTr>
              ))}
            </tbody>
          </table>
        )}
      </AdminDataTable>
    </>
  )
}
