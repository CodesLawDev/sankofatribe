import { redirect } from 'next/navigation'

export default function AdminResetRedirect({
  searchParams,
}: {
  searchParams?: { token?: string }
}) {
  const token = searchParams?.token
  const target = token ? `/reset-password?token=${encodeURIComponent(token)}` : '/reset-password'
  redirect(target)
}
