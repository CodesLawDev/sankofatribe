'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Users, MessageSquare, Wallet, ShoppingCart, Clock, Send } from 'lucide-react'
import { useAdminUser } from '@/lib/admin/context'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminStat from '@/components/admin/admin-stat'
import AdminSection from '@/components/admin/admin-section'
import AdminButton, { AdminQuickLink } from '@/components/admin/admin-button'
import { AdminPageSkeleton } from '@/components/admin/admin-skeleton'

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  todayOrders: number
  todayRevenue: number
}

const initialStats: DashboardStats = {
  totalOrders: 0,
  totalRevenue: 0,
  pendingOrders: 0,
  processingOrders: 0,
  shippedOrders: 0,
  deliveredOrders: 0,
  cancelledOrders: 0,
  todayOrders: 0,
  todayRevenue: 0,
}

const pickNumber = (value: unknown): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value) || 0
  return 0
}

const statusLinks = [
  { key: 'processing', label: 'Processing', href: '/admin/orders?status=processing' },
  { key: 'shipped', label: 'Shipped', href: '/admin/orders?status=shipped' },
  { key: 'delivered', label: 'Delivered', href: '/admin/orders?status=delivered' },
  { key: 'cancelled', label: 'Cancelled', href: '/admin/orders?status=cancelled' },
] as const

export default function AdminDashboardView() {
  const { user } = useAdminUser()
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [smsBalance, setSmsBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, smsRes] = await Promise.all([
          fetch('/api/admin/stats', { credentials: 'include', cache: 'no-store' }),
          fetch('/api/admin/sms/balance', { credentials: 'include', cache: 'no-store' }),
        ])
        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats({
            totalOrders: pickNumber(data.totalOrders),
            totalRevenue: pickNumber(data.totalRevenue),
            pendingOrders: pickNumber(data.pendingOrders),
            processingOrders: pickNumber(data.processingOrders),
            shippedOrders: pickNumber(data.shippedOrders),
            deliveredOrders: pickNumber(data.deliveredOrders),
            cancelledOrders: pickNumber(data.cancelledOrders),
            todayOrders: pickNumber(data.todayOrders),
            todayRevenue: pickNumber(data.todayRevenue),
          })
        }
        if (smsRes.ok) {
          const data = await smsRes.json()
          setSmsBalance(data.balance ?? 0)
        }
      } catch (err) {
        console.error('Dashboard load failed:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return <AdminPageSkeleton />
  }

  const statusValues: Record<string, number> = {
    processing: stats.processingOrders,
    shipped: stats.shippedOrders,
    delivered: stats.deliveredOrders,
    cancelled: stats.cancelledOrders,
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description={user?.username ? `Welcome back, ${user.username}. Here is what needs attention today.` : 'Store overview and quick actions.'}
        actions={<AdminButton href="/admin/orders">View orders</AdminButton>}
      />

      <div className="admin-stagger grid gap-4 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <AdminStat
            accent
            wide
            label="Total revenue"
            value={`GH₵${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            hint="Lifetime paid revenue"
            icon={<Wallet className="h-4 w-4" strokeWidth={1.75} />}
          />
        </div>
        <div className="lg:col-span-3">
          <AdminStat
            label="Orders today"
            value={stats.todayOrders}
            hint="Since midnight"
            icon={<ShoppingCart className="h-4 w-4" strokeWidth={1.75} />}
          />
        </div>
        <div className="lg:col-span-2">
          <AdminStat
            label="Pending"
            value={stats.pendingOrders}
            hint="Needs action"
            icon={<Clock className="h-4 w-4" strokeWidth={1.75} />}
          />
        </div>
        <div className="lg:col-span-2">
          <AdminStat
            label="SMS credits"
            value={smsBalance.toLocaleString()}
            hint="Remaining balance"
            icon={<Send className="h-4 w-4" strokeWidth={1.75} />}
          />
        </div>
      </div>

      <div className="admin-reveal grid gap-6 lg:grid-cols-12" style={{ animationDelay: '120ms' }}>
        <div className="lg:col-span-7">
          <AdminSection title="Order pipeline" description="Counts by fulfillment stage">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {statusLinks.map(({ key, label, href }) => (
                <Link
                  key={key}
                  href={href}
                  className="admin-interactive rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-raised)] p-4"
                >
                  <p className="text-xs text-[var(--admin-text-muted)]">{label}</p>
                  <p className="font-admin-mono mt-2 text-2xl font-semibold text-[var(--admin-text)]">
                    {statusValues[key]}
                  </p>
                </Link>
              ))}
            </div>
          </AdminSection>
        </div>

        <div className="lg:col-span-5">
          <AdminSection title="Quick actions">
            <div className="space-y-2">
              <AdminQuickLink href="/admin/products" icon={<Package className="h-4 w-4" />} label="Manage products" />
              <AdminQuickLink href="/admin/customers" icon={<Users className="h-4 w-4" />} label="View customers" />
              <AdminQuickLink href="/admin/sms" icon={<MessageSquare className="h-4 w-4" />} label="Send SMS campaign" />
            </div>
          </AdminSection>
        </div>
      </div>
    </div>
  )
}
