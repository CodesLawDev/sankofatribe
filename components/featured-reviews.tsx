'use client'

import { Quote } from 'lucide-react'
import { motion } from 'framer-motion'
import StarRating from './star-rating'

export interface FeaturedReview {
    _id: string
    author: string
    rating: number
    title: string
    comment: string
    verified: boolean
    publishedAt: string
}

export default function FeaturedReviews({ reviews }: { reviews: FeaturedReview[] }) {
    if (!reviews || reviews.length === 0) return null

    return (
        <section className="py-20 md:py-32 bg-brand-cream overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold uppercase tracking-[0.3em] mb-4 text-brand-gold">
                        The Tribe Has Spoken
                    </h2>
                    <h3 className="text-3xl md:text-5xl font-light tracking-wider uppercase text-black">
                        Customer Reviews
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={review._id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="bg-white p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative"
                        >
                            <Quote className="absolute top-8 right-8 w-12 h-12 text-brand-cream opacity-50" />
                            
                            <div className="mb-6 relative z-10">
                                <StarRating rating={review.rating} size="sm" />
                            </div>
                            
                            <h4 className="text-lg font-medium mb-4 text-black relative z-10">
                                &quot;{review.title}&quot;
                            </h4>
                            
                            <p className="text-sm text-gray-600 leading-relaxed mb-8 relative z-10 line-clamp-4">
                                {review.comment}
                            </p>
                            
                            <div className="flex items-center justify-between border-t border-gray-100 pt-6 relative z-10">
                                <div>
                                    <p className="text-sm font-bold uppercase tracking-wider text-black">
                                        {review.author}
                                    </p>
                                    {review.verified && (
                                        <p className="text-xs text-green-600 font-medium mt-1">Verified Buyer</p>
                                    )}
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(review.publishedAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
                
                <div className="mt-16 text-center">
                    <a href="/leave-review" className="inline-block border-b border-black text-xs font-bold uppercase tracking-widest pb-1 hover:text-brand-gold hover:border-brand-gold transition-colors">
                        Leave a Review
                    </a>
                </div>
            </div>
        </section>
    )
}
