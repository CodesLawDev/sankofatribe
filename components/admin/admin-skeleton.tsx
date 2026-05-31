import { cn } from '@/lib/utils'

interface AdminSkeletonProps {
  className?: string
}

export function AdminSkeleton({ className }: AdminSkeletonProps) {
  return <div className={cn('admin-shimmer rounded-lg', className)} aria-hidden="true" />
}

export function AdminTableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-[var(--admin-border)]">
      <div className="grid gap-4 px-6 py-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <AdminSkeleton key={i} className="h-3 w-20" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="grid gap-4 px-6 py-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }).map((_, col) => (
            <AdminSkeleton key={col} className="h-4 w-full max-w-[120px]" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function AdminPageSkeleton() {
  return (
    <div className="space-y-6">
      <AdminSkeleton className="h-8 w-48" />
      <AdminSkeleton className="h-4 w-72" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <AdminSkeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <AdminSkeleton className="h-64 rounded-2xl" />
    </div>
  )
}
