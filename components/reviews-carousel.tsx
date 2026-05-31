'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import StarRating from './star-rating'
import Link from 'next/link'

interface Review {
    id: string
    authorName: string
    rating: number
    title: string
    comment: string
    isVerified: boolean
    createdAt: string
}

export default function ReviewsCarousel() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [index, setIndex] = useState(0)

    useEffect(() => {
        fetch('/api/reviews?featured=true&limit=10')
            .then((res) => res.json())
            .then((data) => setReviews(data.reviews || []))
            .catch(() => {})
    }, [])

    const prev = useCallback(() => {
        setIndex((i) => (i === 0 ? reviews.length - 1 : i - 1))
    }, [reviews.length])

    const next = useCallback(() => {
        setIndex((i) => (i === reviews.length - 1 ? 0 : i + 1))
    }, [reviews.length])

    useEffect(() => {
        if (reviews.length <= 1) return
        const timer = setInterval(next, 6000)
        return () => clearInterval(timer)
    }, [reviews.length, next])

    if (!reviews.length) return null

    const review = reviews[index]

    return (
        <section className="py-20 md:py-32 bg-brand-cream overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
                <div className="text-center mb-12">
                    <h2 className="text-sm font-bold uppercase tracking-[0.3em] mb-4 text-brand-accent">
                        The Tribe Has Spoken
                    </h2>
                    <h3 className="text-3xl md:text-5xl font-light tracking-wider uppercase text-black">
                        Customer Reviews
                    </h3>
                </div>

                <div className="relative max-w-3xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.4 }}
                            className="bg-white p-8 md:p-12 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative text-center"
                        >
                            <Quote className="absolute top-8 right-8 w-10 h-10 text-brand-cream opacity-50" />

                            <div className="mb-6 flex justify-center">
                                <StarRating rating={review.rating} size="md" />
                            </div>

                            <h4 className="text-xl md:text-2xl font-medium mb-4 text-black">
                                &quot;{review.title}&quot;
                            </h4>

                            <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-8 line-clamp-4">
                                {review.comment}
                            </p>

                            <div className="border-t border-gray-100 pt-6">
                                <p className="text-sm font-bold uppercase tracking-wider text-black">
                                    {review.authorName}
                                </p>
                                {review.isVerified && (
                                    <p className="text-xs text-green-600 font-medium mt-1">Verified Buyer</p>
                                )}
                                <p className="text-xs text-gray-400 mt-2">
                                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {reviews.length > 1 && (
                        <>
                            <button
                                onClick={prev}
                                aria-label="Previous review"
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 p-2 rounded-full bg-white shadow-md hover:bg-neutral-50 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={next}
                                aria-label="Next review"
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 p-2 rounded-full bg-white shadow-md hover:bg-neutral-50 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>

                            <div className="flex justify-center gap-2 mt-8">
                                {reviews.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setIndex(i)}
                                        aria-label={`Go to review ${i + 1}`}
                                        className={`h-2 rounded-full transition-all ${
                                            i === index ? 'w-6 bg-brand-primary' : 'w-2 bg-neutral-300'
                                        }`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-12 text-center">
                    <Link
                        href="/leave-review"
                        className="inline-block border-b border-black text-xs font-bold uppercase tracking-widest pb-1 hover:text-brand-accent hover:border-brand-accent transition-colors"
                    >
                        Leave a Review
                    </Link>
                </div>
            </div>
        </section>
    )
}
