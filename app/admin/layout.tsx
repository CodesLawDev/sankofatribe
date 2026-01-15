'use client'

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
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
import '../globals.css'
import { Providers } from '../providers'

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

const sidebarLinks: SidebarLink[] = [
    {
        href: '/admin',
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

function AdminShell({ children }: { children: ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [user, setUser] = useState<User | null>(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [isMounted, setIsMounted] = useState(false)

    // Check if current route should show sidebar
    const isLoginPage = pathname === '/admin/login' || pathname === '/admin/reset-password'

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (isLoginPage) {
            setIsLoading(false)
            return
        }

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
    }, [router, pathname, isLoginPage])

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
            router.push('/admin/login')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    if (isLoginPage) {
        return <>{children}</>
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

    // Don't render sidebar content until client-side hydration is complete
    if (!isMounted) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-darkbg flex">
                {/* Server-side render: empty sidebar placeholder */}
                <div className="w-64 bg-black dark:bg-gray-900 text-white transition-all duration-300 flex flex-col fixed h-screen left-0 top-0 z-40" />
                {/* Main content area with margin for sidebar */}
                <div className="ml-64 flex-1">
                    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Loading...</h1>
                    </div>
                    <div className="p-6">{children}</div>
                </div>
            </div>
        )
    }

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
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
                                    isActive ? 'bg-gray-800 text-white' : 'hover:bg-gray-800'
                                }`}
                            >
                                {link.icon}
                                {isSidebarOpen && (
                                    <span className="text-sm font-medium group-hover:text-gray-200">
                                        {link.label}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
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
                {children}
            </div>
        </div>
    )
}

export default function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="dark:bg-darkbg dark:text-white bg-white text-black">
        <Providers>
          <AdminShell>{children}</AdminShell>
        </Providers>
      </body>
    </html>
  )
}
