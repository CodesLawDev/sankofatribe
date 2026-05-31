'use client'

import { useState, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { useAdminAuth } from '@/lib/useAdminAuth'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminSection, { AdminField } from '@/components/admin/admin-section'
import AdminStat from '@/components/admin/admin-stat'
import AdminButton from '@/components/admin/admin-button'
import AdminAlert from '@/components/admin/admin-alert'
import { adminInputClass } from '@/lib/admin/utils'
import { AdminPageSkeleton } from '@/components/admin/admin-skeleton'

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  completedOrders: number
  totalCustomers: number
  avgOrderValue: number
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>
  topProducts: Array<{ name: string; sales: number; revenue: number }>
}

export default function AnalyticsPage() {
  const { user, isLoading: authLoading, isMounted } = useAdminAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return now.getMonth() === 0 ? 12 : now.getMonth()
  })
  const [selectedYear, setSelectedYear] = useState(() => {
    const now = new Date()
    return now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
  })
  const [generatingReport, setGeneratingReport] = useState(false)
  const [reportResult, setReportResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    if (isMounted && user && !authLoading) fetchStats()
  }, [isMounted, user, authLoading])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/stats', { credentials: 'include' })
      if (!response.ok) throw new Error('Failed to fetch stats')
      setStats(await response.json())
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMonthlyReport = async () => {
    try {
      setGeneratingReport(true)
      setReportResult(null)
      const response = await fetch('/api/admin/analytics/monthly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ month: selectedMonth, year: selectedYear }),
      })
      const data = await response.json()
      setReportResult({
        success: response.ok,
        message: data.message || data.error || (response.ok ? 'Report sent' : 'Failed to generate report'),
      })
    } catch {
      setReportResult({ success: false, message: 'Failed to generate report' })
    } finally {
      setGeneratingReport(false)
    }
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  if (authLoading || isLoading) return <AdminPageSkeleton />

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Analytics" description="Business performance and monthly reporting." />

      <AdminSection title="Monthly report" description="Generate and SMS a summary to admin phone numbers.">
        <div className="flex flex-wrap items-end gap-4">
          <AdminField label="Month">
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className={`${adminInputClass} w-auto min-w-[160px]`}>
              {monthNames.map((name, idx) => (
                <option key={idx} value={idx + 1}>{name}</option>
              ))}
            </select>
          </AdminField>
          <AdminField label="Year">
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className={`${adminInputClass} w-auto min-w-[120px]`}>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </AdminField>
          <AdminButton onClick={generateMonthlyReport} disabled={generatingReport}>
            {generatingReport ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Generate report
          </AdminButton>
        </div>
        {reportResult && (
          <AdminAlert variant={reportResult.success ? 'success' : 'error'} className="mt-4">
            {reportResult.message}
          </AdminAlert>
        )}
      </AdminSection>

      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminStat label="Total revenue" value={`GH₵${(stats.totalRevenue || 0).toFixed(2)}`} hint="All time" />
            <AdminStat label="Total orders" value={stats.totalOrders || 0} hint={`${stats.completedOrders || 0} completed`} />
            <AdminStat label="Avg order value" value={`GH₵${(stats.avgOrderValue || 0).toFixed(2)}`} hint="Per transaction" />
            <AdminStat label="Customers" value={stats.totalCustomers || 0} hint="Unique accounts" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <AdminSection title="Order status">
              <div className="space-y-4">
                {[
                  { label: 'Pending', value: stats.pendingOrders || 0, pct: stats.totalOrders ? (stats.pendingOrders / stats.totalOrders) * 100 : 0 },
                  { label: 'Completed', value: stats.completedOrders || 0, pct: stats.totalOrders ? (stats.completedOrders / stats.totalOrders) * 100 : 0 },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-[var(--admin-text-muted)]">{row.label}</span>
                      <span className="font-admin-mono font-medium">{row.value}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[var(--admin-surface-sunken)]">
                      <div className="h-full rounded-full bg-[var(--admin-accent)] transition-[width] duration-300" style={{ width: `${row.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </AdminSection>

            <AdminSection title="Top products">
              <div className="divide-y divide-[var(--admin-border)]">
                {stats.topProducts?.length ? stats.topProducts.map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-[var(--admin-text-muted)]">{product.sales} sold</p>
                    </div>
                    <p className="font-admin-mono text-sm">GH₵{(product.revenue || 0).toFixed(2)}</p>
                  </div>
                )) : (
                  <p className="text-sm text-[var(--admin-text-muted)]">No product data yet.</p>
                )}
              </div>
            </AdminSection>
          </div>

          <AdminSection title="Revenue trend" description="Last 7 days">
            <div className="space-y-3">
              {(stats.revenueByDay || []).slice(-7).map((day, idx) => {
                const maxRevenue = Math.max(...(stats.revenueByDay || []).map((d) => d.revenue), 1)
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="w-24 shrink-0 text-xs text-[var(--admin-text-muted)]">{new Date(day.date).toLocaleDateString()}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--admin-surface-sunken)]">
                      <div className="h-full rounded-full bg-[var(--admin-accent)]" style={{ width: `${(day.revenue / maxRevenue) * 100}%` }} />
                    </div>
                    <div className="w-28 shrink-0 text-right">
                      <p className="font-admin-mono text-sm">GH₵{(day.revenue || 0).toFixed(2)}</p>
                      <p className="text-xs text-[var(--admin-text-muted)]">{day.orders || 0} orders</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </AdminSection>
        </>
      )}
    </div>
  )
}
