'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface AdminButtonProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  disabled?: boolean
  className?: string
}

const variants = {
  primary:
    'bg-[var(--admin-accent)] text-white shadow-[var(--admin-shadow-sm)] hover:opacity-90 disabled:opacity-50',
  secondary:
    'border border-[var(--admin-border-strong)] bg-[var(--admin-surface-raised)] text-[var(--admin-text)] hover:bg-[var(--admin-accent-soft)]',
  ghost:
    'text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent-soft)] hover:text-[var(--admin-text)]',
  danger:
    'bg-red-600 text-white shadow-[var(--admin-shadow-sm)] hover:bg-red-700 disabled:opacity-50',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

export default function AdminButton({
  children,
  href,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled,
  className,
}: AdminButtonProps) {
  const classes = cn(
    'admin-press inline-flex items-center justify-center gap-2 rounded-lg font-medium',
    variants[variant],
    sizes[size],
    className
  )

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  )
}

interface AdminQuickLinkProps {
  href: string
  icon: ReactNode
  label: string
}

export function AdminQuickLink({ href, icon, label }: AdminQuickLinkProps) {
  return (
    <Link
      href={href}
      className="admin-interactive group flex items-center justify-between rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-raised)] px-4 py-3"
    >
      <span className="flex items-center gap-3 text-sm font-medium text-[var(--admin-text)]">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--admin-accent-soft)] text-[var(--admin-accent)] transition-transform duration-200 group-hover:scale-110">
          {icon}
        </span>
        {label}
      </span>
      <span
        className="text-[var(--admin-text-muted)] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[var(--admin-accent)]"
        aria-hidden="true"
      >
        →
      </span>
    </Link>
  )
}

interface AdminFilterBarProps {
  children: ReactNode
  className?: string
}

export function AdminFilterBar({ children, className }: AdminFilterBarProps) {
  return <div className={cn('mb-6 flex flex-wrap gap-3', className)}>{children}</div>
}

export function AdminSearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'min-w-[200px] flex-1 rounded-lg border border-[var(--admin-border-strong)] bg-[var(--admin-surface-raised)] px-3 py-2 text-sm text-[var(--admin-text)] outline-none transition-[border-color,box-shadow] duration-160 focus:border-[var(--admin-accent)] focus:ring-2 focus:ring-[var(--admin-accent)]/20',
        className
      )}
    />
  )
}
