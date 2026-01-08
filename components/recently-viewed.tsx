'use client'

import { useRecentlyViewed } from '@/lib/recently-viewed-context'
import ProductCard from './product-card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'

export default function RecentlyViewed() {
    const { recentlyViewed } = useRecentlyViewed()
    const scrollRef = useRef<HTMLDivElement>(null)

    if (recentlyViewed.length === 0) return null

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 300
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            })
        }
    }

    return (
        <section className="py-16 border-t border-gray-100">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xs uppercase tracking-[0.3em] font-medium">Recently Viewed</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className="p-2 border border-gray-300 hover:border-black transition-colors"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="p-2 border border-gray-300 hover:border-black transition-colors"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {recentlyViewed.map((product) => (
                        <div key={product._id} className="flex-shrink-0 w-64">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
