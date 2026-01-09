'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    DollarSign,
    Clock,
    Truck,
    CheckCircle,
    XCircle,
    TrendingUp,
    ShoppingCart,
    Package,
    Users,
} from 'lucide-react'

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
    paidOrders: number
    unpaidOrders: number
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
    paidOrders: 0,
    unpaidOrders: 0,
}

const pickNumber = (value: any): number => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') return parseFloat(value) || 0
    return 0
}

export default function AdminPage() {
    const [stats, setStats] = useState<DashboardStats>(initialStats)
    const [statsLoading, setStatsLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/stats', {
                    credentials: 'include',
                    cache: 'no-store' as any,
                })
                if (response.ok) {
                    const data = await response.json()
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
                        paidOrders: pickNumber(data.paidOrders),
                        unpaidOrders: pickNumber(data.unpaidOrders),
                    })
                } else {
                    setStats(initialStats)
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error)
                setStats(initialStats)
            } finally {
                setStatsLoading(false)
            }
        }

        fetchStats()
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-darkbg">
            {/* Top Bar */}
            <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 sticky top-0 z-30">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Dashboard
                </h1>
            </div>

            {/* Dashboard Content */}
            <div className="p-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        {
                            label: 'Total Orders',
                            value: statsLoading ? '...' : stats.totalOrders,
                            icon: ShoppingCart,
                            color: 'bg-blue-500',
                            href: '/admin/orders',
                        },
                        {
                            label: 'Total Revenue',
                            value: statsLoading ? '...' : `GH₵${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                            icon: DollarSign,
                            color: 'bg-green-500',
                            href: '/admin/orders',
                        },
                        {
                            label: 'Pending Orders',
                            value: statsLoading ? '...' : stats.pendingOrders,
                            icon: Clock,
                            color: 'bg-yellow-500',
                            href: '/admin/orders?status=pending',
                        },
                        {
                            label: 'Processing',
                            value: statsLoading ? '...' : stats.processingOrders,
                            icon: Truck,
                            color: 'bg-purple-500',
                            href: '/admin/orders?status=processing',
                        },
                        {
                            label: 'Shipped',
                            value: statsLoading ? '...' : stats.shippedOrders,
                            icon: TrendingUp,
                            color: 'bg-indigo-500',
                            href: '/admin/orders?status=shipped',
                        },
                        {
                            label: 'Delivered',
                            value: statsLoading ? '...' : stats.deliveredOrders,
                            icon: CheckCircle,
                            color: 'bg-emerald-500',
                            href: '/admin/orders?status=delivered',
                        },
                        {
                            label: 'Cancelled',
                            value: statsLoading ? '...' : stats.cancelledOrders,
                            icon: XCircle,
                            color: 'bg-red-600',
                            href: '/admin/orders?status=cancelled',
                        },
                        {
                            label: "Today's Orders",
                            value: statsLoading ? '...' : stats.todayOrders,
                            icon: TrendingUp,
                            color: 'bg-cyan-500',
                            href: '/admin/orders?date=today',
                        },
                    ].map((stat, i) => {
                        const IconComponent = stat.icon
                        return (
                            <Link key={i} href={stat.href}>
                                <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow cursor-pointer h-full">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                                                {stat.label}
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                                {stat.value}
                                            </p>
                                        </div>
                                        <div className={`${stat.color} p-3 rounded-lg`}>
                                            <IconComponent className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 p-6 mb-8">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link
                            href="/admin/orders"
                            className="block p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
                        >
                            <ShoppingCart className="w-6 h-6 text-black dark:text-white mb-2 mx-auto" />
                            <p className="font-medium text-gray-900 dark:text-white">
                                View All Orders
                            </p>
                        </Link>
                        <Link
                            href="/admin/orders?status=processing"
                            className="block p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
                        >
                            <Truck className="w-6 h-6 text-black dark:text-white mb-2 mx-auto" />
                            <p className="font-medium text-gray-900 dark:text-white">
                                Process Orders
                            </p>
                        </Link>
                        <Link
                            href="/studio"
                            className="block p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
                        >
                            <Package className="w-6 h-6 text-black dark:text-white mb-2 mx-auto" />
                            <p className="font-medium text-gray-900 dark:text-white">
                                Manage Products
                            </p>
                        </Link>
                        <Link
                            href="/admin/customers"
                            className="block p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
                        >
                            <Users className="w-6 h-6 text-black dark:text-white mb-2 mx-auto" />
                            <p className="font-medium text-gray-900 dark:text-white">
                                View Customers
                            </p>
                        </Link>
                    </div>
                </div>

                {/* Order Status Overview */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Order Status Overview
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span className="text-gray-900 dark:text-white font-medium">
                                    Pending Orders
                                </span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {statsLoading ? '...' : stats.pendingOrders}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-gray-900 dark:text-white font-medium">
                                    Processing
                                </span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {statsLoading ? '...' : stats.processingOrders}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                <span className="text-gray-900 dark:text-white font-medium">
                                    Shipped
                                </span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {statsLoading ? '...' : stats.shippedOrders}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-gray-900 dark:text-white font-medium">
                                    Delivered
                                </span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {statsLoading ? '...' : stats.deliveredOrders}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
