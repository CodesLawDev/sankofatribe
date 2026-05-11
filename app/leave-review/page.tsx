import { Metadata } from 'next'
import { client } from '@/lib/sanity'
import LeaveReviewClient from './leave-review-client'
import { Suspense } from 'react'

export const metadata: Metadata = {
    title: 'Leave a Review | SANKOFA TRIBE',
    description: 'Share your experience with our products.',
}

async function getProducts() {
    const query = `*[_type == "product" && !(_id in path('drafts.**'))] | order(name asc) {
        _id,
        name
    }`
    const products = await client.fetch(query)
    return products
}

export default async function LeaveReviewPage() {
    const products = await getProducts()

    return (
        <div className="bg-brand-cream text-black min-h-screen py-20 md:py-32">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-light tracking-[0.2em] uppercase mb-4">
                        Share Your Experience
                    </h1>
                    <p className="text-sm text-gray-600 tracking-wide">
                        We value your feedback. Let us and others know what you think about your purchase.
                    </p>
                </div>

                <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                    <Suspense fallback={<div className="text-center py-8">Loading form...</div>}>
                        <LeaveReviewClient products={products} />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
