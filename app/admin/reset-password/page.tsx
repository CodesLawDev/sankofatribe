'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AdminResetRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    const target = token ? `/reset-password?token=${encodeURIComponent(token)}` : '/reset-password'
    router.replace(target)
  }, [router, token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-600">Redirecting to reset password...</div>
    </div>
  )
}
