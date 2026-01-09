'use client'

import { useState, useMemo } from 'react'
import { Product } from '@/lib/sanity'
import ProductGrid from './product-grid'
import ProductFilters from './product-filters'
import ActiveFilters from './active-filters'

interface FilterState {
    audience: string
    category: string
    priceRange: string
    sortBy: string
}

interface ProductsWithFiltersProps {
    products: Product[]
    categories: { name: string; slug: string }[]
}

export default function ProductsWithFilters({ products, categories }: ProductsWithFiltersProps) {
    const [filters, setFilters] = useState<FilterState>({
        audience: '',
        category: '',
        priceRange: '',
        sortBy: 'newest',
    })

    const clearFilter = (type: string, value: string) => {
        if (type === 'audience') setFilters((prev) => ({ ...prev, audience: '' }))
        if (type === 'category') setFilters((prev) => ({ ...prev, category: '' }))
        if (type === 'priceRange') setFilters((prev) => ({ ...prev, priceRange: '' }))
    }

    const clearAll = () => setFilters({ audience: '', category: '', priceRange: '', sortBy: 'newest' })

    const filteredProducts = useMemo(() => {
        let result = [...products]

        // Filter by audience
        if (filters.audience) {
            result = result.filter(p => (p as any).audience === filters.audience)
        }

        // Filter by category
        if (filters.category) {
            result = result.filter(p => p.categories?.some((cat: any) => cat.slug.current === filters.category))
        }

        // Filter by price range
        if (filters.priceRange) {
            switch (filters.priceRange) {
                case 'under-50':
                    result = result.filter(p => p.price < 50)
                    break
                case '50-100':
                    result = result.filter(p => p.price >= 50 && p.price <= 100)
                    break
                case '100-200':
                    result = result.filter(p => p.price >= 100 && p.price <= 200)
                    break
                case 'over-200':
                    result = result.filter(p => p.price > 200)
                    break
            }
        }

        // Sort
        switch (filters.sortBy) {
            case 'price-asc':
                result.sort((a, b) => a.price - b.price)
                break
            case 'price-desc':
                result.sort((a, b) => b.price - a.price)
                break
            case 'name-asc':
                result.sort((a, b) => a.name.localeCompare(b.name))
                break
            case 'newest':
            default:
                // Already sorted by newest from API
                break
        }

        return result
    }, [products, filters])

    return (
        <>
            <ProductFilters
                categories={categories}
                onFilterChange={setFilters}
                totalProducts={filteredProducts.length}
            />
            <ActiveFilters
                filters={[
                    ...(filters.audience
                        ? [{ label: audienceLabel(filters.audience), value: filters.audience, type: 'audience' as const }]
                        : []),
                    ...(filters.category
                        ? [{ label: categories.find(c => c.slug === filters.category)?.name || filters.category, value: filters.category, type: 'category' as const }]
                        : []),
                    ...(filters.priceRange
                        ? [{ label: priceRangesLabel(filters.priceRange), value: filters.priceRange, type: 'priceRange' as const }]
                        : []),
                ]}
                onRemove={clearFilter}
                onClearAll={clearAll}
            />
            
            {filteredProducts.length > 0 ? (
                <ProductGrid products={filteredProducts} />
            ) : (
                <div className="text-center py-32">
                    <p className="text-sm text-gray-600 tracking-wide mb-4">No products match your filters</p>
                    <button
                        onClick={clearAll}
                        className="text-xs uppercase tracking-wider underline hover:no-underline"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </>
    )
}

function priceRangesLabel(value: string) {
    switch (value) {
        case 'under-50':
            return 'Under $50'
        case '50-100':
            return '$50 - $100'
        case '100-200':
            return '$100 - $200'
        case 'over-200':
            return 'Over $200'
        default:
            return 'All Prices'
    }
}

function audienceLabel(value: string) {
    switch (value) {
        case 'men':
            return 'Men'
        case 'women':
            return 'Women'
        case 'kids':
            return 'Kids'
        case 'unisex':
            return 'Unisex'
        default:
            return 'All'
    }
}
