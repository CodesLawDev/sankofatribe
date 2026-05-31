// Server-only: import from Server Components (e.g. app/admin/layout.tsx), not client components.
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

export const adminSans = GeistSans
export const adminMono = GeistMono

export const adminFontClasses = `${GeistSans.variable} ${GeistMono.variable} font-admin-sans`
