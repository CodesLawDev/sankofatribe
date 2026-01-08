import { AdminUser } from './adminTypes'

const SESSION_KEY = 'admin_session'
const SESSION_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

export function saveAdminSession(session: { user: AdminUser; token: string }) {
  if (typeof window === 'undefined') return
  
  const expiresAt = Date.now() + SESSION_EXPIRY
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    ...session,
    expiresAt,
  }))
}

export function getAdminSession(): { user: AdminUser; token: string } | null {
  if (typeof window === 'undefined') return null
  
  const sessionStr = localStorage.getItem(SESSION_KEY)
  if (!sessionStr) return null
  
  try {
    const session = JSON.parse(sessionStr)
    
    // Check if session has expired
    if (session.expiresAt && Date.now() > session.expiresAt) {
      clearAdminSession()
      return null
    }
    
    return {
      user: session.user,
      token: session.token,
    }
  } catch {
    return null
  }
}

export function clearAdminSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}

export function isAdminLoggedIn(): boolean {
  return !!getAdminSession()
}
