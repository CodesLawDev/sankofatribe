import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AdminSectionProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
  action?: ReactNode
}

export default function AdminSection({ title, description, children, className, action }: AdminSectionProps) {
  return (
    <section className={cn('admin-card rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-raised)]', className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4 md:px-6">
          <div>
            {title && (
              <h2 className="font-admin-display text-sm font-semibold tracking-tight text-[var(--admin-text)] md:text-base">
                {title}
              </h2>
            )}
            {description && <p className="mt-1 text-xs text-[var(--admin-text-muted)]">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5 md:p-6">{children}</div>
    </section>
  )
}

interface AdminFieldProps {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}

export function AdminField({ label, htmlFor, hint, error, children, className }: AdminFieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-[var(--admin-text)]">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-[var(--admin-text-muted)]">{hint}</p>}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  )
}

interface AdminDataTableProps {
  children: ReactNode
  className?: string
}

export function AdminDataTable({ children, className }: AdminDataTableProps) {
  return (
    <div className={cn('admin-card overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-raised)]', className)}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}

export function AdminTableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-[var(--admin-border)] bg-[var(--admin-surface-sunken)]">
      <tr>{children}</tr>
    </thead>
  )
}

export function AdminTh({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        'px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)] md:px-6',
        className
      )}
    >
      {children}
    </th>
  )
}

export function AdminTd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td className={cn('px-5 py-4 text-sm text-[var(--admin-text)] md:px-6', className)}>
      {children}
    </td>
  )
}

export function AdminTr({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr
      className={cn(
        'border-b border-[var(--admin-border)] last:border-0 transition-colors duration-120',
        'hover:bg-[var(--admin-accent-soft)]',
        className
      )}
    >
      {children}
    </tr>
  )
}
