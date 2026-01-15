'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, ShoppingCart, Users, DollarSign } from 'lucide-react'
import { getAdminSession } from '@/lib/adminAuth'
import { hasPermission } from '@/lib/adminTypes'

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
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const session = getAdminSession()
    if (!session || !hasPermission(session.user, 'view_analytics')) {
      router.push('/admin')
      return
    }

    fetchStats()
  }, [router])

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>
          <h1 className="text-3xl font-light tracking-wider uppercase">Analytics & Insights</h1>
          <p className="text-sm text-gray-600 mt-2">Overview of your business performance</p>
        </div>

        {/* Key Metrics */}
        {stats && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 w-full">
              {/* Total Revenue */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Total Revenue</h3>
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-3xl font-light">₵{(stats.totalRevenue || 0).toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-2">All time</p>
              </div>

              {/* Total Orders */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Total Orders</h3>
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-3xl font-light">{stats.totalOrders || 0}</p>
                <p className="text-xs text-gray-500 mt-2">{stats.completedOrders || 0} completed</p>
              </div>

              {/* Average Order Value */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Avg Order Value</h3>
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-3xl font-light">₵{(stats.avgOrderValue || 0).toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-2">Per transaction</p>
              </div>

              {/* Total Customers */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Customers</h3>
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <p className="text-3xl font-light">{stats.totalCustomers || 0}</p>
                <p className="text-xs text-gray-500 mt-2">Unique customers</p>
              </div>
            </div>

            {/* Order Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 w-full">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium uppercase tracking-wider mb-6">Order Status</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Pending</span>
                      <span className="text-sm font-medium">{stats.pendingOrders || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
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
                      <span className="text-sm">Completed</span>
                      <span className="text-sm font-medium">{stats.completedOrders || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
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
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium uppercase tracking-wider mb-6">Top Products</h3>
                <div className="space-y-4">
                  {stats.topProducts && stats.topProducts.length > 0 ? (
                    stats.topProducts.map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sales} sold</p>
                        </div>
                        <p className="text-sm font-medium">₵{(product.revenue || 0).toFixed(2)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No product data available yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Revenue Trend */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium uppercase tracking-wider mb-6">Revenue Trend (Last 7 Days)</h3>
              <div className="space-y-4">
                {stats.revenueByDay && stats.revenueByDay.length > 0 ? (
                  stats.revenueByDay.slice(-7).map((day, idx) => {
                    const maxRevenue = Math.max(...stats.revenueByDay.map(d => d.revenue), 1)
                    return (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{new Date(day.date).toLocaleDateString()}</span>
                        <div className="flex items-center gap-4 flex-1 ml-4">
                          <div className="flex-1 h-8 bg-gray-100 rounded overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{
                                width: `${((day.revenue / maxRevenue) * 100)}%`,
                              }}
                            />
                          </div>
                          <div className="text-right min-w-max">
                            <p className="text-sm font-medium">₵{(day.revenue || 0).toFixed(2)}</p>
                            <p className="text-xs text-gray-500">{day.orders || 0} orders</p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-sm text-gray-500">No revenue data available yet</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
