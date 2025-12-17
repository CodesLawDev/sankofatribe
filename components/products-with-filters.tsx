'use client'

import { useState, useMemo } from 'react'
import { Product } from '@/lib/sanity'
import ProductGrid from './product-grid'
import ProductFilters from './product-filters'

interface FilterState {
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
        category: '',
        priceRange: '',
        sortBy: 'newest',
    })

    const filteredProducts = useMemo(() => {
        let result = [...products]

        // Filter by category
        if (filters.category) {
            result = result.filter(p => p.category?.slug?.current === filters.category)
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
            
            {filteredProducts.length > 0 ? (
                <ProductGrid products={filteredProducts} />
            ) : (
                <div className="text-center py-32">
                    <p className="text-sm text-gray-600 tracking-wide mb-4">No products match your filters</p>
                    <button
                        onClick={() => setFilters({ category: '', priceRange: '', sortBy: 'newest' })}
                        className="text-xs uppercase tracking-wider underline hover:no-underline"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </>
    )
}
