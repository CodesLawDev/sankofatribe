import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AdminAlertProps {
  variant: 'success' | 'error' | 'info'
  children: ReactNode
  className?: string
}

const variants = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200',
  error: 'border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200',
  info: 'border-[var(--admin-border-strong)] bg-[var(--admin-accent-soft)] text-[var(--admin-text)]',
}

export default function AdminAlert({ variant, children, className }: AdminAlertProps) {
  return (
    <div className={cn('rounded-xl border px-4 py-3 text-sm', variants[variant], className)} role="alert">
      {children}
    </div>
  )
}
