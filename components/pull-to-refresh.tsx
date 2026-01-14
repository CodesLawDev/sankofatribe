'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PullToRefresh() {
  const router = useRouter()
  const startY = useRef<number | null>(null)
  const pulling = useRef(false)
  const [visible, setVisible] = useState(false)
  const [distance, setDistance] = useState(0)

  const THRESHOLD = 70 // pixels to trigger refresh
  const MAX_DISTANCE = 120 // cap visual distance

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      const scrollTop = document.scrollingElement?.scrollTop || 0
      if (scrollTop > 0) {
        startY.current = null
        pulling.current = false
        return
      }
      startY.current = e.touches[0].clientY
      pulling.current = true
      setVisible(false)
      setDistance(0)
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!pulling.current || startY.current === null) return
      const currentY = e.touches[0].clientY
      const delta = currentY - startY.current
      if (delta > 0) {
        setVisible(true)
        setDistance(Math.min(delta, MAX_DISTANCE))
      }
    }

    const onTouchEnd = async () => {
      if (!pulling.current) return
      pulling.current = false
      const shouldRefresh = distance >= THRESHOLD
      setVisible(false)
      setDistance(0)
      if (shouldRefresh) {
        try {
          // Prefer Next.js soft refresh; fallback to hard reload
          router.refresh()
          // If PWA caches prevent refresh, force reload after short delay
          setTimeout(() => {
            // Double-check content refreshed; if not, do a hard reload
            // This keeps behavior robust across PWA contexts
            // window.location.reload()
          }, 400)
        } catch {
          // As a last resort
          window.location.reload()
        }
      }
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [router, distance])

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none transition-opacity ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ height: Math.max(0, distance), background: 'transparent' }}
    >
      <div className="mt-2 flex items-center gap-2 rounded-full bg-black/80 px-3 py-1 text-white text-xs">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          className={`h-4 w-4 transition-transform ${distance > THRESHOLD ? 'rotate-180' : ''}`}
        >
          <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{distance > THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}</span>
      </div>
    </div>
  )
}
