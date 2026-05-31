'use client'

import { useState, useEffect, useCallback } from 'react'
import { Star, Check, X, Trash2 } from 'lucide-react'
import { useAdminAuth } from '@/lib/useAdminAuth'
import AdminPageHeader from '@/components/admin/admin-page-header'
import { AdminFilterBar, AdminSearchInput } from '@/components/admin/admin-button'
import AdminEmptyState from '@/components/admin/admin-empty-state'
import AdminAlert from '@/components/admin/admin-alert'
import { AdminDataTable, AdminTableHead, AdminTh, AdminTr, AdminTd } from '@/components/admin/admin-section'
import { AdminTableSkeleton } from '@/components/admin/admin-skeleton'
import { adminBadgeClass, adminSelectClass, reviewStatusVariant } from '@/lib/admin/utils'

interface Review {
  id: string
  productName: string
  authorName: string
  rating: number
  title: string
  comment: string
  status: string
  isFeatured: boolean
  isVerified: boolean
  createdAt: string
}

export default function AdminReviewsPage() {
  const { user, isLoading: authLoading, isMounted } = useAdminAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({ adminMode: 'true', limit: '100' })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const response = await fetch(`/api/reviews?${params}`, { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    if (isMounted && user && !authLoading) fetchReviews()
  }, [isMounted, user, authLoading, fetchReviews])

  const updateReview = async (reviewId: string, patch: { status?: string; isFeatured?: boolean }) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(patch),
      })
      if (!response.ok) throw new Error('Update failed')
      setMessage({ type: 'success', text: 'Review updated.' })
      fetchReviews()
      setTimeout(() => setMessage(null), 3000)
    } catch {
      setMessage({ type: 'error', text: 'Could not update review.' })
    }
  }

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review permanently?')) return
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!response.ok) throw new Error('Delete failed')
      setMessage({ type: 'success', text: 'Review deleted.' })
      fetchReviews()
    } catch {
      setMessage({ type: 'error', text: 'Could not delete review.' })
    }
  }

  const filtered = reviews.filter((r) => {
    const q = searchQuery.toLowerCase()
    return (
      r.authorName.toLowerCase().includes(q) ||
      r.productName.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q)
    )
  })

  return (
    <>
      <AdminPageHeader
        title="Reviews"
        description="Moderate customer reviews before they appear on the storefront."
      />

      {message && (
        <AdminAlert variant={message.type === 'success' ? 'success' : 'error'} className="mb-6">
          {message.text}
        </AdminAlert>
      )}

      <AdminFilterBar>
        <AdminSearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search reviews..." />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${adminSelectClass} w-auto min-w-[140px]`}>
          <option value="all">All status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </AdminFilterBar>

      <AdminDataTable>
        {isLoading ? (
          <AdminTableSkeleton rows={6} cols={6} />
        ) : filtered.length === 0 ? (
          <AdminEmptyState title="No reviews" description="Customer reviews will appear here for moderation." />
        ) : (
          <table className="min-w-full">
            <AdminTableHead>
              <AdminTh>Customer</AdminTh>
              <AdminTh>Product</AdminTh>
              <AdminTh>Rating</AdminTh>
              <AdminTh>Review</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Actions</AdminTh>
            </AdminTableHead>
            <tbody>
              {filtered.map((review) => (
                <AdminTr key={review.id}>
                  <AdminTd>
                    <p className="font-medium">{review.authorName}</p>
                    <p className="text-xs text-[var(--admin-text-muted)]">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </AdminTd>
                  <AdminTd className="text-[var(--admin-text-muted)]">{review.productName}</AdminTd>
                  <AdminTd>
                    <span className="inline-flex items-center gap-1 font-admin-mono">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {review.rating}
                    </span>
                  </AdminTd>
                  <AdminTd className="max-w-xs">
                    <p className="font-medium line-clamp-1">{review.title}</p>
                    <p className="text-xs text-[var(--admin-text-muted)] line-clamp-2">{review.comment}</p>
                  </AdminTd>
                  <AdminTd>
                    <span className={adminBadgeClass(reviewStatusVariant(review.status))}>{review.status}</span>
                    {review.isFeatured && (
                      <span className={`${adminBadgeClass('accent')} ml-1`}>Featured</span>
                    )}
                  </AdminTd>
                  <AdminTd>
                    <div className="flex flex-wrap gap-1">
                      {review.status !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => updateReview(review.id, { status: 'APPROVED' })}
                          className="admin-press rounded-lg p-2 text-emerald-600"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      {review.status !== 'REJECTED' && (
                        <button
                          type="button"
                          onClick={() => updateReview(review.id, { status: 'REJECTED' })}
                          className="admin-press rounded-lg p-2 text-red-600"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => updateReview(review.id, { isFeatured: !review.isFeatured })}
                        className="admin-press rounded-lg px-2 py-1 text-xs text-[var(--admin-accent)]"
                      >
                        {review.isFeatured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteReview(review.id)}
                        className="admin-press rounded-lg p-2 text-[var(--admin-text-muted)]"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </AdminTd>
                </AdminTr>
              ))}
            </tbody>
          </table>
        )}
      </AdminDataTable>
    </>
  )
}
