/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 })
 *   // In a route handler:
 *   const ip = request.headers.get('x-forwarded-for') || 'unknown'
 *   if (!limiter.check(ip)) {
 *     return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
 *   }
 */

interface RateLimiterOptions {
  /** Time window in milliseconds */
  windowMs: number
  /** Maximum number of requests per window */
  max: number
}

interface Entry {
  timestamps: number[]
}

export function createRateLimiter(opts: RateLimiterOptions) {
  const store = new Map<string, Entry>()

  // Periodically clean up stale entries (every 60 s)
  const cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < opts.windowMs)
      if (entry.timestamps.length === 0) store.delete(key)
    }
  }, 60_000)

  // Allow GC if the module is ever unloaded
  if (typeof cleanupInterval === 'object' && 'unref' in cleanupInterval) {
    cleanupInterval.unref()
  }

  return {
    /**
     * Returns `true` if the request is allowed, `false` if rate-limited.
     */
    check(key: string): boolean {
      const now = Date.now()
      let entry = store.get(key)

      if (!entry) {
        entry = { timestamps: [] }
        store.set(key, entry)
      }

      // Remove timestamps outside window
      entry.timestamps = entry.timestamps.filter((t) => now - t < opts.windowMs)

      if (entry.timestamps.length >= opts.max) {
        return false
      }

      entry.timestamps.push(now)
      return true
    },
  }
}
