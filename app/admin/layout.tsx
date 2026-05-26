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
    MessageSquare,
    BarChart3,
    UserCog,
    Ticket,
    Star
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
        href: '/admin/tickets',
        label: 'Tickets',
        icon: <Ticket className="w-5 h-5" />,
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
        label: 'SMS Marketing',
        icon: <MessageSquare className="w-5 h-5" />,
    },
    {
        href: '/admin/analytics',
        label: 'Analytics',
        icon: <BarChart3 className="w-5 h-5" />,
    },
    {
        href: '/admin/reviews',
        label: 'Reviews',
        icon: <Star className="w-5 h-5" />,
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

    // Check if current route should show sidebar
    const isLoginPage = pathname === '/admin/login' || pathname === '/admin/reset-password'

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
            <div className="min-h-screen bg-brand-cream dark:bg-darkbg flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-dark dark:border-white"></div>
                    <p className="mt-4 text-neutral-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-brand-cream dark:bg-darkbg flex" suppressHydrationWarning>
            {/* Sidebar Desktop */}
            <div
                className={`hidden lg:flex flex-col fixed h-screen left-0 top-0 z-40 bg-brand-cream dark:bg-gray-900 border-r border-brand-primary/10 dark:border-gray-800 text-brand-dark dark:text-white transition-all duration-300 ${
                    isSidebarOpen ? 'w-64' : 'w-20'
                }`}
                suppressHydrationWarning
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-brand-primary/10 dark:border-gray-800">
                    {isSidebarOpen && (
                        <h2 className="font-bold text-xl tracking-tight">SANKOFA</h2>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 hover:bg-brand-primary/5 dark:hover:bg-gray-800 rounded-md transition-colors text-neutral-600 dark:text-gray-400"
                    >
                        {isSidebarOpen ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                                    isActive 
                                        ? 'bg-brand-primary text-white shadow-sm' 
                                        : 'text-neutral-600 dark:text-gray-300 hover:bg-brand-primary/5 dark:hover:bg-gray-800 hover:text-brand-dark dark:hover:text-white'
                                }`}
                            >
                                <span className={isActive ? 'text-white' : 'text-neutral-500 dark:text-gray-400 group-hover:text-brand-dark dark:group-hover:text-white'}>
                                    {link.icon}
                                </span>
                                {isSidebarOpen && (
                                    <span className="text-sm font-medium">
                                        {link.label}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-brand-primary/10 dark:border-gray-800">
                    {isSidebarOpen && user && (
                        <div className="mb-4 px-2">
                            <p className="text-xs text-neutral-500 dark:text-gray-400 font-medium uppercase tracking-wider">Signed in as</p>
                            <p className="font-medium text-sm text-brand-dark dark:text-white truncate">{user.username}</p>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center ${isSidebarOpen ? 'justify-start px-3' : 'justify-center'} gap-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium`}
                    >
                        <LogOut className="w-5 h-5" />
                        {isSidebarOpen && <span>Sign Out</span>}
                    </button>
                </div>
            </div>

            {/* Mobile Header */}
             <div className="lg:hidden fixed top-0 left-0 right-0 bg-brand-cream dark:bg-gray-900 border-b border-brand-primary/10 dark:border-gray-800 z-30 px-4 h-16 flex items-center justify-between" suppressHydrationWarning>
                 <h2 className="font-bold text-xl tracking-tight">SANKOFA</h2>
                 <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 hover:bg-brand-primary/5 dark:hover:bg-gray-800 rounded-md"
                 >
                     <Menu className="w-6 h-6" />
                 </button>
             </div>

             {/* Mobile Sidebar Overlay */}
             <div 
                className={`lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                onClick={() => setIsSidebarOpen(false)} 
             />

            {/* Mobile Sidebar */}
            <div
                className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-brand-cream dark:bg-gray-900 transform transition-transform duration-300 ease-in-out ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                 <div className="h-16 flex items-center justify-between px-4 border-b border-brand-primary/10 dark:border-gray-800">
                    <h2 className="font-bold text-xl tracking-tight">SANKOFA</h2>
                    <button onClick={() => setIsSidebarOpen(false)}>
                        <X className="w-6 h-6" />
                    </button>
                 </div>
                 <nav className="p-4 space-y-1">
                    {sidebarLinks.map((link) => {
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                                    isActive 
                                        ? 'bg-brand-primary text-white' 
                                        : 'text-neutral-600 dark:text-gray-300 hover:bg-brand-primary/5 dark:hover:bg-gray-800 hover:text-brand-dark dark:hover:text-white'
                                }`}
                            >
                                <span className={isActive ? 'text-white' : 'text-neutral-500 dark:text-gray-400'}>
                                    {link.icon}
                                </span>
                                <span className="font-medium">{link.label}</span>
                            </Link>
                        )
                    })}
                 </nav>
            </div>

            {/* Main Content */}
            <div
                className={`flex-1 transition-all duration-300 w-full lg:ml-64 pt-16 lg:pt-0`}
            >
                <div className="p-4 lg:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
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
      <body className="bg-brand-cream text-brand-dark dark:bg-darkbg dark:text-white antialiased">
        <Providers>
          <AdminShell>{children}</AdminShell>
        </Providers>
      </body>
    </html>
  )
}
