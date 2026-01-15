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
    LogOut,
    Menu,
    X,
    DollarSign,
    Clock,
    Truck,
    CheckCircle,
    XCircle,
    TrendingUp,
    MessageSquare,
    UserCog,
} from 'lucide-react'

interface User {
    id: string
    email: string
    role: string
    username?: string
}

interface SidebarLink {
    href: string
    label: string
    icon: React.ReactNode
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

export default function AdminDashboard() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState<DashboardStats>(initialStats)
    const [statsLoading, setStatsLoading] = useState(true)

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
                        // Fetch stats after user is confirmed
                        await fetchStats()
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

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
            router.push('/admin/login')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-darkbg flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        )
    }

    const sidebarLinks: SidebarLink[] = [
        {
            href: '/admin/dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard className="w-5 h-5" />,
        },
        {
            href: '/admin/products',
            label: 'Products',
            icon: <Package className="w-5 h-5" />,
        },
        {
            href: '/admin/orders',
            label: 'Orders',
            icon: <ShoppingCart className="w-5 h-5" />,
        },
        {
            href: '/admin/customers',
            label: 'Customers',
            icon: <Users className="w-5 h-5" />,
        },
        {
            href: '/admin/team',
            label: 'Team',
            icon: <UserCog className="w-5 h-5" />,
        },
        {
            href: '/admin/sms',
            label: 'Send SMS',
            icon: <MessageSquare className="w-5 h-5" />,
        },
        {
            href: '/admin/settings',
            label: 'Settings',
            icon: <Settings className="w-5 h-5" />,
        },
    ]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-darkbg flex">
            {/* Sidebar */}
            <div
                className={`${
                    isSidebarOpen ? 'w-64' : 'w-20'
                } bg-black dark:bg-gray-900 text-white transition-all duration-300 flex flex-col fixed h-screen left-0 top-0 z-40`}
            >
                {/* Logo */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    {isSidebarOpen && (
                        <h2 className="font-bold text-lg whitespace-nowrap">SANKOFA TRIBE</h2>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1 hover:bg-gray-800 rounded-lg"
                    >
                        {isSidebarOpen ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
                    {sidebarLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors group"
                        >
                            {link.icon}
                            {isSidebarOpen && (
                                <span className="text-sm font-medium group-hover:text-gray-200">
                                    {link.label}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* User Section */}
                <div className="border-t border-gray-800 p-3 space-y-2">
                    {isSidebarOpen && user && (
                        <div className="px-3 py-2 text-xs">
                            <p className="text-gray-400">Logged in as</p>
                            <p className="font-medium text-white truncate">{user.username}</p>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div
                className={`${
                    isSidebarOpen ? 'ml-64' : 'ml-20'
                } flex-1 transition-all duration-300`}
            >
                {/* Top Bar */}
                <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Dashboard
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {user?.username}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                {user?.role}
                            </p>
                        </div>
                    </div>
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
        </div>
    )
}
