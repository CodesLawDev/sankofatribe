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
} from 'lucide-react'

interface User {
    id: string
    username: string
    email: string
    role: string
}

interface SidebarLink {
    href: string
    label: string
    icon: React.ReactNode
}

export default function AdminDashboard() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isLoading, setIsLoading] = useState(true)

    // Fetch user session on mount
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch('/api/admin/session')
                if (response.ok) {
                    const data = await response.json()
                    setUser(data.user)
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
            await fetch('/api/auth/logout', { method: 'POST' })
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
                            { label: 'Total Orders', value: '0', icon: '📦' },
                            { label: 'Total Revenue', value: '$0', icon: '💰' },
                            { label: 'Total Customers', value: '0', icon: '👥' },
                            { label: 'Total Products', value: '0', icon: '📊' },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                                            {stat.label}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div className="text-3xl">{stat.icon}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 p-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Link
                                href="/admin/products/new"
                                className="block p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Package className="w-6 h-6 text-black dark:text-white mb-2" />
                                <p className="font-medium text-gray-900 dark:text-white">
                                    Add Product
                                </p>
                            </Link>
                            <Link
                                href="/admin/orders"
                                className="block p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <ShoppingCart className="w-6 h-6 text-black dark:text-white mb-2" />
                                <p className="font-medium text-gray-900 dark:text-white">
                                    View Orders
                                </p>
                            </Link>
                            <Link
                                href="/admin/customers"
                                className="block p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Users className="w-6 h-6 text-black dark:text-white mb-2" />
                                <p className="font-medium text-gray-900 dark:text-white">
                                    Customers
                                </p>
                            </Link>
                            <Link
                                href="/admin/settings"
                                className="block p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Settings className="w-6 h-6 text-black dark:text-white mb-2" />
                                <p className="font-medium text-gray-900 dark:text-white">
                                    Settings
                                </p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
