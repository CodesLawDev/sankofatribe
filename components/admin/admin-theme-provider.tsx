'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type AdminTheme = 'light' | 'dark'

interface AdminThemeContextValue {
  theme: AdminTheme
  toggle: () => void
  setTheme: (theme: AdminTheme) => void
}

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null)
const STORAGE_KEY = 'admin-theme'

/**
 * Self-contained dark/light theme for the admin section.
 *
 * The storefront's next-themes provider is locked to light (forcedTheme="light"),
 * so it would override any global theme change. Instead, this provider toggles a
 * `dark` class on a wrapper around the admin tree, which the admin CSS targets via
 * `.dark .admin-root`. It is scoped to /admin and never affects the storefront.
 */
export function AdminThemeProvider({ children, className }: { children: ReactNode; className?: string }) {
  const [theme, setThemeState] = useState<AdminTheme>('light')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'dark' || stored === 'light') setThemeState(stored)
    } catch {
      /* localStorage unavailable */
    }
  }, [])

  const persist = useCallback((next: AdminTheme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const setTheme = useCallback(
    (next: AdminTheme) => {
      setThemeState(next)
      persist(next)
    },
    [persist]
  )

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      persist(next)
      return next
    })
  }, [persist])

  return (
    <AdminThemeContext.Provider value={{ theme, toggle, setTheme }}>
      <div className={cn(className, theme === 'dark' && 'dark')} suppressHydrationWarning>
        {children}
      </div>
    </AdminThemeContext.Provider>
  )
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext)
  if (!ctx) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider')
  }
  return ctx
}
