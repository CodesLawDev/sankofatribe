'use client'

import { createContext, useContext, type ReactNode } from 'react'

export interface AdminUser {
  id: string
  email: string
  role: string
  username?: string
  permissions?: string[]
}

interface AdminContextValue {
  user: AdminUser | null
}

const AdminContext = createContext<AdminContextValue>({ user: null })

export function AdminProvider({ user, children }: { user: AdminUser | null; children: ReactNode }) {
  return <AdminContext.Provider value={{ user }}>{children}</AdminContext.Provider>
}

export function useAdminUser() {
  return useContext(AdminContext)
}
