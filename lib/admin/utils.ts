import { cn } from '@/lib/utils'

export type AdminBadgeVariant =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'accent'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'pending'

const badgeStyles: Record<AdminBadgeVariant, string> = {
  neutral: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  success: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
  danger: 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300',
  accent: 'bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]',
  pending: 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
  processing: 'bg-stone-100 text-stone-800 dark:bg-stone-800/60 dark:text-stone-200',
  shipped: 'bg-orange-50 text-orange-900 dark:bg-orange-950/40 dark:text-orange-300',
  delivered: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  cancelled: 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-300',
}

export function adminBadgeClass(variant: AdminBadgeVariant) {
  return cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', badgeStyles[variant])
}

export function orderStatusVariant(status: string): AdminBadgeVariant {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return 'pending'
    case 'PROCESSING':
      return 'processing'
    case 'SHIPPED':
      return 'shipped'
    case 'DELIVERED':
      return 'delivered'
    case 'CANCELLED':
      return 'cancelled'
    default:
      return 'neutral'
  }
}

export function reviewStatusVariant(status: string): AdminBadgeVariant {
  switch (status.toUpperCase()) {
    case 'APPROVED':
      return 'success'
    case 'REJECTED':
      return 'danger'
    case 'PENDING':
      return 'warning'
    default:
      return 'neutral'
  }
}

export const adminInputClass =
  'w-full rounded-lg border border-[var(--admin-border-strong)] bg-[var(--admin-surface-raised)] px-3 py-2 text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] outline-none transition-[border-color,box-shadow] duration-160 focus:border-[var(--admin-accent)] focus:ring-2 focus:ring-[var(--admin-accent)]/20'

export const adminSelectClass = adminInputClass
