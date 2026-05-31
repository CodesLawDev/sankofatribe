'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Renders storefront-only chrome (header, footer, popups, floating widgets).
 * Returns null on /admin and /studio routes so those sections own the full
 * viewport and storefront overlays never mount as siblings of their trees
 * (which caused React commit-phase removeChild/insertBefore crashes).
 */
export default function StorefrontChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isStandalone =
    (pathname?.startsWith('/admin') || pathname?.startsWith('/studio')) ?? false

  if (isStandalone) return null

  return <>{children}</>
}
