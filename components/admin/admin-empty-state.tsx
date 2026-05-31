import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AdminEmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export default function AdminEmptyState({ title, description, action, className }: AdminEmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}>
      <p className="font-admin-display text-base font-medium text-[var(--admin-text)]">{title}</p>
      {description && <p className="mt-2 max-w-sm text-sm text-[var(--admin-text-muted)]">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
