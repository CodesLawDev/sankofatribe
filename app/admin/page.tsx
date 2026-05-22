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
import { Button } from '@/components/ui/button'

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
    currency: 'credits',
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
                <div className="glass-card flex flex-col items-center gap-4 p-8">
                    <div className="h-10 w-10 animate-spin rounded-full border-3 border-slate-900 dark:border-white border-t-transparent" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">{/* Header Section */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Welcome back, {user?.username}. Here&apos;s what&apos;s happening today.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/admin/orders">
                            <Button variant="default" size="default">
                                View Orders
                            </Button>
                        </Link>
                    </div>
                </div>

            {/* Key Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-slate-200/50 dark:border-slate-700/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="h-5 w-5 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            GH₵{statsLoading ? '...' : stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Lifetime revenue
                        </p>
                    </CardContent>
                </Card>

                <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-slate-200/50 dark:border-slate-700/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Orders Today
                        </CardTitle>
                        <ShoppingCart className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {statsLoading ? '...' : stats.todayOrders}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                           <span className={stats.todayOrders > 0 ? "text-emerald-600 font-medium" : "text-slate-500 dark:text-slate-400"}>
                                {stats.todayOrders > 0 ? '+' : ''}{stats.todayOrders}
                           </span> since midnight
                        </p>
                    </CardContent>
                </Card>

                <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-slate-200/50 dark:border-slate-700/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Pending Orders
                        </CardTitle>
                        <Clock className="h-5 w-5 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {statsLoading ? '...' : stats.pendingOrders}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Requires attention
                        </p>
                    </CardContent>
                </Card>

                <Card className="backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-slate-200/50 dark:border-slate-700/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            SMS Credits
                        </CardTitle>
                        <MessageSquare className="h-5 w-5 text-violet-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {smsLoading ? '...' : smsBalance.balance.toLocaleString()}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            SMS credits remaining
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Order Status Cards - Span 4 columns */}
                <Card className="col-span-full lg:col-span-4 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-slate-200/50 dark:border-slate-700/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Order Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
                            <Link href="/admin/orders?status=processing" className='group block'>
                                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 transition-all hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">Processing</span>
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{statsLoading ? '-' : stats.processingOrders}</div>
                                </div>
                            </Link>

                            <Link href="/admin/orders?status=shipped" className='group block'>
                                <div className="rounded-lg border border-brand-primary/10 dark:border-gray-800 p-4 transition-all hover:bg-brand-primary/5 dark:hover:bg-gray-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                                        <span className="text-sm font-medium text-neutral-600 dark:text-gray-400 group-hover:text-brand-dark dark:group-hover:text-white">Shipped</span>
                                    </div>
                                    <div className="text-2xl font-bold text-brand-dark dark:text-white">{statsLoading ? '-' : stats.shippedOrders}</div>
                                </div>
                            </Link>

                            <Link href="/admin/orders?status=delivered" className='group block'>
                                <div className="rounded-lg border border-brand-primary/10 dark:border-gray-800 p-4 transition-all hover:bg-brand-primary/5 dark:hover:bg-gray-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span className="text-sm font-medium text-neutral-600 dark:text-gray-400 group-hover:text-brand-dark dark:group-hover:text-white">Delivered</span>
                                    </div>
                                    <div className="text-2xl font-bold text-brand-dark dark:text-white">{statsLoading ? '-' : stats.deliveredOrders}</div>
                                </div>
                            </Link>

                            <Link href="/admin/orders?status=cancelled" className='group block'>
                                <div className="rounded-lg border border-brand-primary/10 dark:border-gray-800 p-4 transition-all hover:bg-brand-primary/5 dark:hover:bg-gray-800">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-2 w-2 rounded-full bg-red-500" />
                                        <span className="text-sm font-medium text-neutral-600 dark:text-gray-400 group-hover:text-brand-dark dark:group-hover:text-white">Cancelled</span>
                                    </div>
                                    <div className="text-2xl font-bold text-brand-dark dark:text-white">{statsLoading ? '-' : stats.cancelledOrders}</div>
                                </div>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions - Span 3 columns */}
                <Card className="col-span-full lg:col-span-3 bg-brand-cream dark:bg-gray-900 border border-brand-primary/10 dark:border-gray-800 shadow-sm h-full">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-brand-dark dark:text-white">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <Link
                                href="/admin/products"
                                className="flex items-center justify-between rounded-lg border border-brand-primary/10 dark:border-gray-800 p-3 hover:bg-brand-primary/5 dark:hover:bg-gray-800 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/5 dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-900 border border-transparent group-hover:border-brand-primary/10 dark:group-hover:border-gray-700 transition-all">
                                        <Package className="h-5 w-5 text-neutral-600 dark:text-gray-300" />
                                    </div>
                                    <span className="text-sm font-medium text-brand-dark dark:text-white">Manage Products</span>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-neutral-500 group-hover:text-brand-dark dark:group-hover:text-white" />
                            </Link>

                            <Link
                                href="/admin/customers"
                                className="flex items-center justify-between rounded-lg border border-brand-primary/10 dark:border-gray-800 p-3 hover:bg-brand-primary/5 dark:hover:bg-gray-800 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/5 dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-900 border border-transparent group-hover:border-brand-primary/10 dark:group-hover:border-gray-700 transition-all">
                                        <Users className="h-5 w-5 text-neutral-600 dark:text-gray-300" />
                                    </div>
                                    <span className="text-sm font-medium text-brand-dark dark:text-white">View Customers</span>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-neutral-500 group-hover:text-brand-dark dark:group-hover:text-white" />
                            </Link>

                            <Link
                                href="/admin/sms"
                                className="flex items-center justify-between rounded-lg border border-brand-primary/10 dark:border-gray-800 p-3 hover:bg-brand-primary/5 dark:hover:bg-gray-800 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/5 dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-900 border border-transparent group-hover:border-brand-primary/10 dark:group-hover:border-gray-700 transition-all">
                                        <MessageSquare className="h-5 w-5 text-neutral-600 dark:text-gray-300" />
                                    </div>
                                    <span className="text-sm font-medium text-brand-dark dark:text-white">Send SMS Blast</span>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-neutral-500 group-hover:text-brand-dark dark:group-hover:text-white" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    )
}
