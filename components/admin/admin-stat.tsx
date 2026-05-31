import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AdminStatProps {
  label: string
  value: ReactNode
  hint?: string
  icon?: ReactNode
  className?: string
  wide?: boolean
  accent?: boolean
}

export default function AdminStat({ label, value, hint, icon, className, wide, accent }: AdminStatProps) {
  return (
    <div
      className={cn(
        'admin-card group relative h-full overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-raised)] p-5',
        accent && 'bg-gradient-to-br from-[var(--admin-accent-soft)] to-[var(--admin-surface-raised)]',
        wide && 'md:col-span-2',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">{label}</p>
        {icon && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]">
            {icon}
          </span>
        )}
      </div>
      <p className="font-admin-mono mt-2 text-2xl font-semibold tracking-tight text-[var(--admin-text)] md:text-3xl">
        {value}
      </p>
      {hint && <p className="mt-1.5 text-xs text-[var(--admin-text-muted)]">{hint}</p>}
    </div>
  )
}
