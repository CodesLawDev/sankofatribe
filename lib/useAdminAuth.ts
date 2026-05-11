import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminUser {
  id: string
  email: string
  role: string
  username?: string
  permissions?: string[]
}

export function useAdminAuth() {
  const router = useRouter()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' })
        if (!response.ok) {
          router.push('/admin/login')
          return
        }

        const data = await response.json()
        const userData = data.user

        // Check if user is admin
        if (userData.role !== 'ADMIN' && userData.role !== 'SUPERADMIN') {
          router.push('/admin')
          return
        }

        setUser({
          id: userData.id,
          email: userData.email,
          role: userData.role,
          username: userData.firstName || userData.email,
          permissions: userData.permissions || [],
        })
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/admin/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [isMounted, router])

  return { user, isLoading, isMounted }
}
