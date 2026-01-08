'use client'

import { useState } from 'react'
import StarRating from './star-rating'
import { CheckCircle } from 'lucide-react'

export interface Review {
    _id: string
    author: string
    rating: number
    title: string
    comment: string
    verified: boolean
    publishedAt: string
}

interface ProductReviewsProps {
    reviews: Review[]
    averageRating: number
    totalReviews: number
    productId: string
}

export default function ProductReviews({
    reviews,
    averageRating,
    totalReviews,
    productId,
}: ProductReviewsProps) {
    const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent')

    const sortedReviews = [...reviews].sort((a, b) => {
        if (sortBy === 'recent') {
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        } else if (sortBy === 'highest') {
            return b.rating - a.rating
        } else {
            return a.rating - b.rating
        }
    })

    const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => r.rating === star).length,
        percentage: reviews.length > 0 ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
    }))

    return (
        <div className="space-y-8">
            {/* Rating Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-gray-100">
                {/* Average Rating */}
                <div className="text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div>
                            <p className="text-5xl font-light">{averageRating.toFixed(1)}</p>
                            <StarRating rating={averageRating} size="lg" />
                            <p className="text-xs text-neutral-600 mt-2">Based on {totalReviews} reviews</p>
                        </div>
                    </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                    {ratingDistribution.map(({ star, count, percentage }) => (
                        <div key={star} className="flex items-center gap-3">
                            <span className="text-xs w-8">{star} ★</span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-yellow-400 transition-all"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="text-xs text-neutral-600 w-8 text-right">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm uppercase tracking-wider font-medium">Customer Reviews</h3>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-xs border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                    <option value="recent">Most Recent</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                </select>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                {sortedReviews.length === 0 ? (
                    <p className="text-center text-neutral-600 py-12">No reviews yet. Be the first to review!</p>
                ) : (
                    sortedReviews.map((review) => (
                        <div key={review._id} className="pb-6 border-b border-gray-100 last:border-0">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-medium">{review.author}</span>
                                        {review.verified && (
                                            <span className="flex items-center gap-1 text-xs text-green-600">
                                                <CheckCircle className="h-3 w-3" />
                                                Verified Purchase
                                            </span>
                                        )}
                                    </div>
                                    <StarRating rating={review.rating} size="sm" />
                                </div>
                                <span className="text-xs text-neutral-600">
                                    {new Date(review.publishedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>
                            <h4 className="text-sm font-medium mb-2">{review.title}</h4>
                            <p className="text-sm text-neutral-700 leading-relaxed">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
