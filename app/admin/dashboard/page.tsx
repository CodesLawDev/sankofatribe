'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingCart,
    Settings,
    DollarSign,
    Clock,
    Truck,
    CheckCircle,
    XCircle,
    TrendingUp,
    MessageSquare,
    ArrowUpRight,
    ArrowDownRight,
    CreditCard
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface User {
    id: string
    email: string
    role: string
    username?: string
}

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

interface SMSBalance {
    balance: number
    currency: string
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

const initialSMSBalance: SMSBalance = {
    balance: 0,
    currency: 'GHS',
}

const pickNumber = (value: any): number => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') return parseFloat(value) || 0
    return 0
}

export default function AdminDashboard() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState<DashboardStats>(initialStats)
    const [statsLoading, setStatsLoading] = useState(true)
    const [smsBalance, setSmsBalance] = useState<SMSBalance>(initialSMSBalance)
    const [smsLoading, setSmsLoading] = useState(true)

    // Helper function to fetch stats
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

    // Helper function to fetch SMS balance
    const fetchSMSBalance = async () => {
        try {
            setSmsLoading(true)
            const response = await fetch('/api/admin/sms/balance', {
                credentials: 'include',
                cache: 'no-store' as any,
            })
            if (response.ok) {
                const data = await response.json()
                setSmsBalance({
                    balance: data.balance || 0,
                    currency: data.currency || 'GHS',
                })
            } else {
                setSmsBalance(initialSMSBalance)
            }
        } catch (error) {
            console.error('Failed to fetch SMS balance:', error)
            setSmsBalance(initialSMSBalance)
        } finally {
            setSmsLoading(false)
        }
    }

    // Fetch user session on mount
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch('/api/auth/me', { credentials: 'include' })
                if (response.ok) {
                    const data = await response.json()
                    const userData = data.user

                    if (userData.role === 'ADMIN' || userData.role === 'SUPERADMIN') {
                        setUser({
                            id: userData.id,
                            email: userData.email,
                            role: userData.role,
                            username: userData.firstName || userData.email,
                        })
                        // Fetch stats and SMS balance after user is confirmed
                        await Promise.all([fetchStats(), fetchSMSBalance()])
                    } else {
                        router.push('/admin/login')
                    }
                } else {
                    router.push('/admin/login')
                }
            } catch (error) {
                console.error('Failed to fetch session:', error)
                router.push('/admin/login')
            } finally {
                setIsLoading(false)
            }
        }

        fetchSession()
    }, [router])

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    <p className="text-sm text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
                    <p className="text-gray-500">
                        Welcome back, {user?.username}. Here&apos;s what&apos;s happening today.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/admin/orders">
                        <button className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all">
                            View Orders
                        </button>
                    </Link>
                </div>
            </div>

            {/* Key Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            GH₵{statsLoading ? '...' : stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Lifetime revenue
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Orders Today
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {statsLoading ? '...' : stats.todayOrders}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                           <span className={stats.todayOrders > 0 ? "text-green-600 font-medium" : "text-gray-500"}>
                                {stats.todayOrders > 0 ? '+' : ''}{stats.todayOrders}
                           </span> since midnight
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Pending Orders
                        </CardTitle>
                        <Clock className="h-4 w-4 text-orange-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {statsLoading ? '...' : stats.pendingOrders}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Requires attention
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            SMS Credits
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {smsLoading ? '...' : smsBalance.balance.toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {smsBalance.currency} balance
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Order Status Cards - Span 4 columns */}
                <Card className="col-span-full lg:col-span-4 border-gray-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-gray-900">Order Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
                            <Link href="/admin/orders?status=processing" className='group block'>
                                <div className="rounded-lg border border-gray-100 p-4 transition-all hover:bg-gray-50 hover:border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900">Processing</span>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{statsLoading ? '-' : stats.processingOrders}</div>
                                </div>
                            </Link>

                            <Link href="/admin/orders?status=shipped" className='group block'>
                                <div className="rounded-lg border border-gray-100 p-4 transition-all hover:bg-gray-50 hover:border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                                        <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900">Shipped</span>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{statsLoading ? '-' : stats.shippedOrders}</div>
                                </div>
                            </Link>

                            <Link href="/admin/orders?status=delivered" className='group block'>
                                <div className="rounded-lg border border-gray-100 p-4 transition-all hover:bg-gray-50 hover:border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900">Delivered</span>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{statsLoading ? '-' : stats.deliveredOrders}</div>
                                </div>
                            </Link>

                            <Link href="/admin/orders?status=cancelled" className='group block'>
                                <div className="rounded-lg border border-gray-100 p-4 transition-all hover:bg-gray-50 hover:border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-2 w-2 rounded-full bg-red-500" />
                                        <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900">Cancelled</span>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{statsLoading ? '-' : stats.cancelledOrders}</div>
                                </div>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions - Span 3 columns */}
                <Card className="col-span-full lg:col-span-3 border-gray-100 shadow-sm h-full">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-gray-900">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <Link
                                href="/admin/products"
                                className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all">
                                        <Package className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">Manage Products</span>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-gray-900" />
                            </Link>

                            <Link
                                href="/admin/customers"
                                className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all">
                                        <Users className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">View Customers</span>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-gray-900" />
                            </Link>

                            <Link
                                href="/admin/sms"
                                className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-all">
                                        <MessageSquare className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">Send SMS Blast</span>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-gray-900" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
