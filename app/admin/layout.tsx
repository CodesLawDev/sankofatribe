import type { ReactNode } from 'react'
import '../globals.css'
import './admin.css'
import { adminSans, adminMono } from '@/lib/admin/fonts'
import AdminShell from '@/components/admin/admin-shell'
import { AdminThemeProvider } from '@/components/admin/admin-theme-provider'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminThemeProvider
      className={`${adminSans.variable} ${adminMono.variable} ${adminSans.className} antialiased`}
    >
      <AdminShell>{children}</AdminShell>
    </AdminThemeProvider>
  )
}
