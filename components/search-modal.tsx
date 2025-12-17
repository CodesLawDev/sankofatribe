'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Search, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity'

interface SearchResult {
    _id: string
    name: string
    slug: { current: string }
    images: any[]
    price: number
    category?: { name: string }
}

interface SearchModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    const searchProducts = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([])
            setSearched(false)
            return
        }

        setLoading(true)
        setSearched(true)

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
            const data = await response.json()
            setResults(data.products || [])
        } catch (error) {
            console.error('Search error:', error)
            setResults([])
        } finally {
            setLoading(false)
        }
    }, [])

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            searchProducts(query)
        }, 300)

        return () => clearTimeout(timer)
    }, [query, searchProducts])

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setQuery('')
            setResults([])
            setSearched(false)
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] bg-white">
            {/* Header */}
            <div className="border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
                    <div className="flex items-center h-20">
                        <div className="flex-1 flex items-center gap-4">
                            <Search className="h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search products..."
                                className="flex-1 text-lg bg-transparent outline-none placeholder:text-gray-400"
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:opacity-60 transition-opacity"
                            aria-label="Close search"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 overflow-y-auto max-h-[calc(100vh-80px)]">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : results.length > 0 ? (
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-8">
                            {results.length} {results.length === 1 ? 'Result' : 'Results'}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {results.map((product) => (
                                <Link
                                    key={product._id}
                                    href={`/products/${product.slug.current}`}
                                    onClick={onClose}
                                    className="group block"
                                >
                                    <div className="relative aspect-[3/4] overflow-hidden bg-neutral-50 mb-4">
                                        {product.images?.[0] ? (
                                            <Image
                                                src={urlFor(product.images[0]).width(400).height(533).url()}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                                                <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                                                    No Image
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-xs uppercase tracking-[0.15em] font-medium group-hover:opacity-60 transition-opacity">
                                        {product.name}
                                    </h3>
                                    <p className="text-xs text-neutral-600 mt-1">${product.price.toFixed(2)}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : searched && query.trim() ? (
                    <div className="text-center py-16">
                        <p className="text-sm text-gray-600 mb-2">No results found for "{query}"</p>
                        <p className="text-xs text-gray-400">Try a different search term</p>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-sm text-gray-500">Start typing to search products</p>
                    </div>
                )}
            </div>
        </div>
    )
}
