'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Analytics tracker component
 * Tracks page views when route changes
 */
export default function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Don't track admin routes or API routes
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/api')) {
      return
    }

    // Track page view
    const trackPageView = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer || undefined,
          }),
        })
      } catch (error) {
        // Silently fail - analytics should not break the app
        console.debug('Analytics tracking failed:', error)
      }
    }

    trackPageView()
  }, [pathname])

  return null
}
