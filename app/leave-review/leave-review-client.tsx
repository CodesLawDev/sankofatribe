'use client'

import { useState, FormEvent } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'

type Product = {
    _id: string
    name: string
}

export default function LeaveReviewClient({ products }: { products: Product[] }) {
    const searchParams = useSearchParams()
    const defaultProductId = searchParams?.get('product') || ''

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        productId: defaultProductId,
        rating: 5,
        title: '',
        comment: '',
        author: '',
        email: '',
    })

    const handleRatingClick = (rating: number) => {
        setFormData({ ...formData, rating })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong')
            }

            setIsSuccess(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="w-8 h-8 fill-current" />
                </div>
                <h3 className="text-2xl font-light uppercase tracking-wider mb-4">Thank You!</h3>
                <p className="text-gray-600 mb-8">Your review has been submitted and is pending approval.</p>
                <Button onClick={() => window.location.href = '/'} className="btn-glass-primary">
                    Return to Home
                </Button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="productId" className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                    Product <span className="text-red-500">*</span>
                </label>
                <select
                    id="productId"
                    name="productId"
                    required
                    value={formData.productId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm"
                >
                    <option value="" disabled>Select a product</option>
                    {products.map((product) => (
                        <option key={product._id} value={product._id}>
                            {product.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                    Overall Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingClick(star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                        >
                            <Star
                                className={`w-8 h-8 ${
                                    star <= formData.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="title" className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                    Review Title <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    maxLength={100}
                    placeholder="Brief summary of your review"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm"
                />
            </div>

            <div>
                <label htmlFor="comment" className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                    Your Review <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="comment"
                    name="comment"
                    required
                    rows={5}
                    maxLength={1000}
                    placeholder="Tell us what you think..."
                    value={formData.comment}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm resize-y"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="author" className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                        Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="author"
                        name="author"
                        required
                        placeholder="John Doe"
                        value={formData.author}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="john@example.com (Optional)"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">We will only use this to verify your purchase.</p>
                </div>
            </div>

            <div className="pt-4">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 text-sm font-bold uppercase tracking-widest disabled:opacity-50"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
            </div>
        </form>
    )
}
