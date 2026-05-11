'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, ShoppingCart, Users, DollarSign, FileText, Send, Loader2 } from 'lucide-react'
import { useAdminAuth } from '@/lib/useAdminAuth'

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

interface MonthlyReport {
  id: string
  month: number
  year: number
  totalOrders: number
  totalRevenue: number
  totalPageViews: number
  uniqueVisitors: number
  newCustomers: number
  successfulPayments: number
  failedPayments: number
  smsSent: boolean
  createdAt: string
}

export default function AnalyticsPage() {
  const router = useRouter()
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
  const [reportResult, setReportResult] = useState<{ success: boolean; message: string; report?: MonthlyReport } | null>(null)

  useEffect(() => {
    if (isMounted && user && !authLoading) {
      fetchStats()
    }
  }, [isMounted, user, authLoading])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
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
        body: JSON.stringify({ month: selectedMonth, year: selectedYear }),
      })

      const data = await response.json()

      if (!response.ok) {
        setReportResult({ success: false, message: data.error || 'Failed to generate report' })
      } else {
        setReportResult({
          success: true,
          message: data.message || 'Report generated successfully',
          report: data.report,
        })
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
      setReportResult({ success: false, message: 'Failed to generate report' })
    } finally {
      setGeneratingReport(false)
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-brand-cream dark:bg-darkbg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary dark:border-white"></div>
          <p className="mt-4 text-brand-dark dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-cream dark:bg-darkbg">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-gray-400 hover:text-brand-dark dark:hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-brand-dark dark:text-white">Analytics & Insights</h1>
          <p className="text-sm text-neutral-600 dark:text-gray-400 mt-2">Overview of your business performance</p>
        </div>

        {/* Monthly Report Generator */}
        <div className="bg-brand-cream dark:bg-gray-900 rounded-lg border border-brand-primary/10 dark:border-gray-800 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-brand-primary" />
            <h3 className="text-lg font-medium text-brand-dark dark:text-white uppercase tracking-wider">Monthly Report</h3>
          </div>
          <p className="text-sm text-neutral-600 dark:text-gray-400 mb-4">
            Generate and send a monthly analytics report via SMS to all admin phone numbers.
          </p>
          
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs text-neutral-500 dark:text-gray-500 mb-1 uppercase tracking-wider">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-brand-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {monthNames.map((name, idx) => (
                  <option key={idx} value={idx + 1}>{name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-neutral-500 dark:text-gray-500 mb-1 uppercase tracking-wider">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-brand-dark dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={generateMonthlyReport}
              disabled={generatingReport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {generatingReport ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Generate & Send Report
                </>
              )}
            </button>
          </div>

          {/* Report Result */}
          {reportResult && (
            <div className={`mt-4 p-4 rounded-lg ${reportResult.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
              <p className={`text-sm font-medium ${reportResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                {reportResult.message}
              </p>
              {reportResult.report && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-500 dark:text-gray-500">Orders</p>
                    <p className="font-medium text-brand-dark dark:text-white">{reportResult.report.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 dark:text-gray-500">Revenue</p>
                    <p className="font-medium text-brand-dark dark:text-white">₵{Number(reportResult.report.totalRevenue).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 dark:text-gray-500">Page Views</p>
                    <p className="font-medium text-brand-dark dark:text-white">{reportResult.report.totalPageViews}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 dark:text-gray-500">New Customers</p>
                    <p className="font-medium text-brand-dark dark:text-white">{reportResult.report.newCustomers}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Key Metrics */}
        {stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 w-full">
              {/* Total Revenue */}
              <div className="bg-brand-cream dark:bg-gray-900 rounded-lg border border-brand-primary/10 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-neutral-600 dark:text-gray-400 uppercase tracking-wider">Total Revenue</h3>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-3xl font-light text-brand-dark dark:text-white">₵{(stats.totalRevenue || 0).toFixed(2)}</p>
                <p className="text-xs text-neutral-500 dark:text-gray-500 mt-2">All time</p>
              </div>

              {/* Total Orders */}
              <div className="bg-brand-cream dark:bg-gray-900 rounded-lg border border-brand-primary/10 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-neutral-600 dark:text-gray-400 uppercase tracking-wider">Total Orders</h3>
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-3xl font-light text-brand-dark dark:text-white">{stats.totalOrders || 0}</p>
                <p className="text-xs text-neutral-500 dark:text-gray-500 mt-2">{stats.completedOrders || 0} completed</p>
              </div>

              {/* Average Order Value */}
              <div className="bg-brand-cream dark:bg-gray-900 rounded-lg border border-brand-primary/10 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-neutral-600 dark:text-gray-400 uppercase tracking-wider">Avg Order Value</h3>
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-3xl font-light text-brand-dark dark:text-white">₵{(stats.avgOrderValue || 0).toFixed(2)}</p>
                <p className="text-xs text-neutral-500 dark:text-gray-500 mt-2">Per transaction</p>
              </div>

              {/* Total Customers */}
              <div className="bg-brand-cream dark:bg-gray-900 rounded-lg border border-brand-primary/10 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-neutral-600 dark:text-gray-400 uppercase tracking-wider">Customers</h3>
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-3xl font-light text-brand-dark dark:text-white">{stats.totalCustomers || 0}</p>
                <p className="text-xs text-neutral-500 dark:text-gray-500 mt-2">Unique customers</p>
              </div>
            </div>

            {/* Order Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 w-full">
              <div className="bg-brand-cream dark:bg-gray-900 rounded-lg border border-brand-primary/10 dark:border-gray-800 p-6">
                <h3 className="text-lg font-medium text-brand-dark dark:text-white uppercase tracking-wider mb-6">Order Status</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-600 dark:text-gray-400">Pending</span>
                      <span className="text-sm font-medium text-brand-dark dark:text-white">{stats.pendingOrders || 0}</span>
                    </div>
                    <div className="w-full bg-brand-cream dark:bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{
                          width: `${(stats.totalOrders && stats.pendingOrders) ? ((stats.pendingOrders / stats.totalOrders) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-600 dark:text-gray-400">Completed</span>
                      <span className="text-sm font-medium text-brand-dark dark:text-white">{stats.completedOrders || 0}</span>
                    </div>
                    <div className="w-full bg-brand-cream dark:bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(stats.totalOrders && stats.completedOrders) ? ((stats.completedOrders / stats.totalOrders) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-brand-cream dark:bg-gray-900 rounded-lg border border-brand-primary/10 dark:border-gray-800 p-6">
                <h3 className="text-lg font-medium text-brand-dark dark:text-white uppercase tracking-wider mb-6">Top Products</h3>
                <div className="space-y-4">
                  {stats.topProducts && stats.topProducts.length > 0 ? (
                    stats.topProducts.map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium text-brand-dark dark:text-white">{product.name}</p>
                          <p className="text-xs text-neutral-500 dark:text-gray-500">{product.sales} sold</p>
                        </div>
                        <p className="text-sm font-medium text-brand-dark dark:text-white">₵{(product.revenue || 0).toFixed(2)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-neutral-500 dark:text-gray-500">No product data available yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Revenue Trend */}
            <div className="bg-brand-cream dark:bg-gray-900 rounded-lg border border-brand-primary/10 dark:border-gray-800 p-6">
              <h3 className="text-lg font-medium text-brand-dark dark:text-white uppercase tracking-wider mb-6">Revenue Trend (Last 7 Days)</h3>
              <div className="space-y-4">
                {stats.revenueByDay && stats.revenueByDay.length > 0 ? (
                  stats.revenueByDay.slice(-7).map((day, idx) => {
                    const maxRevenue = Math.max(...stats.revenueByDay.map(d => d.revenue), 1)
                    return (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-neutral-600 dark:text-gray-400">{new Date(day.date).toLocaleDateString()}</span>
                        <div className="flex items-center gap-4 flex-1 ml-4">
                          <div className="flex-1 h-8 bg-brand-cream dark:bg-gray-800 rounded overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{
                                width: `${((day.revenue / maxRevenue) * 100)}%`,
                              }}
                            />
                          </div>
                          <div className="text-right min-w-max">
                            <p className="text-sm font-medium text-brand-dark dark:text-white">₵{(day.revenue || 0).toFixed(2)}</p>
                            <p className="text-xs text-neutral-500 dark:text-gray-500">{day.orders || 0} orders</p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-neutral-500 dark:text-gray-500">No revenue data available yet</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
