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
  Star,
} from 'lucide-react'
import { AdminProvider, type AdminUser } from '@/lib/admin/context'
import AdminThemeToggle from '@/components/admin/admin-theme-toggle'
import { AdminPageSkeleton } from '@/components/admin/admin-skeleton'

interface SidebarLink {
  href: string
  label: string
  icon: ReactNode
}

const sidebarLinks: SidebarLink[] = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} /> },
  { href: '/admin/products', label: 'Products', icon: <Package className="h-4 w-4" strokeWidth={1.75} /> },
  { href: '/admin/orders', label: 'Orders', icon: <ShoppingCart className="h-4 w-4" strokeWidth={1.75} /> },
  { href: '/admin/tickets', label: 'Tickets', icon: <Ticket className="h-4 w-4" strokeWidth={1.75} /> },
  { href: '/admin/customers', label: 'Customers', icon: <Users className="h-4 w-4" strokeWidth={1.75} /> },
  { href: '/admin/team', label: 'Team', icon: <UserCog className="h-4 w-4" strokeWidth={1.75} /> },
  { href: '/admin/sms', label: 'SMS Marketing', icon: <MessageSquare className="h-4 w-4" strokeWidth={1.75} /> },
  { href: '/admin/analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" strokeWidth={1.75} /> },
  { href: '/admin/reviews', label: 'Reviews', icon: <Star className="h-4 w-4" strokeWidth={1.75} /> },
  { href: '/admin/settings', label: 'Settings', icon: <Settings className="h-4 w-4" strokeWidth={1.75} /> },
]

function pageTitle(pathname: string): string {
  const link = sidebarLinks.find((l) => l.href === pathname)
  return link?.label ?? 'Admin'
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/reset-password'

  useEffect(() => {
    if (isAuthPage) {
      setIsLoading(false)
      return
    }

    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' })
        if (!response.ok) {
          router.push('/admin/login')
          return
        }
        const data = await response.json()
        const userData = data.user
        if (userData.role === 'ADMIN' || userData.role === 'SUPERADMIN') {
          setUser({
            id: userData.id,
            email: userData.email,
            role: userData.role,
            username: userData.firstName || userData.email,
            permissions: userData.permissions ?? [],
          })
        } else {
          router.push('/admin/login')
        }
      } catch {
        router.push('/admin/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [router, pathname, isAuthPage])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      /* continue logout */
    }
    router.push('/admin/login')
  }

  if (isAuthPage) {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <div className="admin-root flex min-h-[100dvh] bg-[var(--admin-surface)]">
        <div className="hidden w-64 shrink-0 border-r border-[var(--admin-border)] bg-[var(--admin-surface-raised)] lg:block" />
        <div className="flex-1 p-6 lg:p-8">
          <AdminPageSkeleton />
        </div>
      </div>
    )
  }

  const navLinkClass = (active: boolean, collapsed?: boolean) =>
    [
      'admin-press flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-160',
      active
        ? 'bg-[var(--admin-accent)] text-white'
        : 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent-soft)] hover:text-[var(--admin-text)]',
      collapsed ? 'justify-center' : '',
    ].join(' ')

  const sidebarContent = (collapsed?: boolean, onNavigate?: () => void) => (
    <>
      <div className={`flex h-14 items-center border-b border-[var(--admin-border)] px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <span className="font-admin-display text-sm font-bold tracking-[0.2em] text-[var(--admin-text)]">SANKOFA</span>
        )}
        {!onNavigate && (
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="admin-press hidden rounded-lg p-1.5 text-[var(--admin-text-muted)] lg:inline-flex"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        )}
        {onNavigate && (
          <button type="button" onClick={onNavigate} className="admin-press rounded-lg p-1.5" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={navLinkClass(isActive, collapsed)}
              title={collapsed ? link.label : undefined}
            >
              {link.icon}
              {!collapsed && <span>{link.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-[var(--admin-border)] p-3">
        {!collapsed && user && (
          <div className="mb-3 px-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">Signed in</p>
            <p className="truncate text-sm font-medium text-[var(--admin-text)]">{user.username}</p>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className={`admin-press flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </>
  )

  return (
    <AdminProvider user={user}>
      <div className="admin-root flex min-h-[100dvh] bg-[var(--admin-surface)] text-[var(--admin-text)]">
        <aside
          className={`admin-drawer fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-[var(--admin-border)] bg-[var(--admin-surface-raised)] transition-[width] duration-200 lg:flex ${sidebarOpen ? 'w-60' : 'w-[72px]'}`}
          style={{ transitionTimingFunction: 'var(--admin-ease-out)' }}
        >
          {sidebarContent(!sidebarOpen)}
        </aside>

        <div
          className={`fixed inset-0 z-40 bg-zinc-950/40 transition-opacity duration-200 lg:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          style={{ transitionTimingFunction: 'var(--admin-ease-out)' }}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />

        <aside
          className={`admin-drawer fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--admin-border)] bg-[var(--admin-surface-raised)] transition-transform duration-250 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ transitionTimingFunction: 'var(--admin-ease-out)' }}
        >
          {sidebarContent(false, () => setMobileOpen(false))}
        </aside>

        <div className={`flex min-w-0 flex-1 flex-col transition-[margin] duration-200 ${sidebarOpen ? 'lg:ml-60' : 'lg:ml-[72px]'}`}>
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-[var(--admin-border)] bg-[var(--admin-surface)]/95 px-4 backdrop-blur-sm lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="admin-press rounded-lg p-2 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">Admin</p>
                <p className="font-admin-display text-sm font-semibold text-[var(--admin-text)]">{pageTitle(pathname)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <AdminThemeToggle />
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-[1400px]">{children}</div>
          </main>
        </div>
      </div>
    </AdminProvider>
  )
}
