'use client'

import { useState } from 'react'
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react'

interface FilterState {
    audience: string
    category: string
    priceRange: string
    sortBy: string
}

interface ProductFiltersProps {
    categories: { name: string; slug: string }[]
    onFilterChange: (filters: FilterState) => void
    totalProducts: number
}

const priceRanges = [
    { label: 'All Prices', value: '' },
    { label: 'Under $50', value: 'under-50' },
    { label: '$50 - $100', value: '50-100' },
    { label: '$100 - $200', value: '100-200' },
    { label: 'Over $200', value: 'over-200' },
]

const sortOptions = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Name: A-Z', value: 'name-asc' },
]

export default function ProductFilters({ categories, onFilterChange, totalProducts }: ProductFiltersProps) {
    const [filters, setFilters] = useState<FilterState>({
        audience: '',
        category: '',
        priceRange: '',
        sortBy: 'newest',
    })
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

    const updateFilter = (key: keyof FilterState, value: string) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        onFilterChange(newFilters)
    }

    const clearFilters = () => {
        const newFilters = { audience: '', category: '', priceRange: '', sortBy: 'newest' }
        setFilters(newFilters)
        onFilterChange(newFilters)
    }

    const hasActiveFilters = filters.audience || filters.category || filters.priceRange

    return (
        <>
            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-8">
                    {/* Audience Filter */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] hover:opacity-60 transition-opacity">
                            Audience
                            <ChevronDown className="h-3 w-3" />
                        </button>
                        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 min-w-[200px]">
                            {[
                                { label: 'All', value: '' },
                                { label: 'Men', value: 'men' },
                                { label: 'Women', value: 'women' },
                                { label: 'Kids', value: 'kids' },
                                { label: 'Unisex', value: 'unisex' },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => updateFilter('audience', opt.value)}
                                    className={`block w-full text-left px-4 py-3 text-xs hover:bg-gray-50 transition-colors ${
                                        filters.audience === opt.value ? 'font-medium' : ''
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] hover:opacity-60 transition-opacity">
                            Category
                            <ChevronDown className="h-3 w-3" />
                        </button>
                        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 min-w-[180px]">
                            <button
                                onClick={() => updateFilter('category', '')}
                                className={`block w-full text-left px-4 py-3 text-xs hover:bg-gray-50 transition-colors ${
                                    !filters.category ? 'font-medium' : ''
                                }`}
                            >
                                All Categories
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.slug}
                                    onClick={() => updateFilter('category', cat.slug)}
                                    className={`block w-full text-left px-4 py-3 text-xs hover:bg-gray-50 transition-colors ${
                                        filters.category === cat.slug ? 'font-medium' : ''
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Filter */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] hover:opacity-60 transition-opacity">
                            Price
                            <ChevronDown className="h-3 w-3" />
                        </button>
                        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 min-w-[180px]">
                            {priceRanges.map((range) => (
                                <button
                                    key={range.value}
                                    onClick={() => updateFilter('priceRange', range.value)}
                                    className={`block w-full text-left px-4 py-3 text-xs hover:bg-gray-50 transition-colors ${
                                        filters.priceRange === range.value ? 'font-medium' : ''
                                    }`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-black transition-colors"
                        >
                            <X className="h-3 w-3" />
                            Clear Filters
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-6">
                    <span className="text-xs text-gray-500">{totalProducts} Products</span>

                    {/* Sort */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] hover:opacity-60 transition-opacity">
                            Sort By: {sortOptions.find(o => o.value === filters.sortBy)?.label}
                            <ChevronDown className="h-3 w-3" />
                        </button>
                        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-100 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 min-w-[180px]">
                            {sortOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => updateFilter('sortBy', option.value)}
                                    className={`block w-full text-left px-4 py-3 text-xs hover:bg-gray-50 transition-colors ${
                                        filters.sortBy === option.value ? 'font-medium' : ''
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Filters */}
            <div className="lg:hidden mb-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setMobileFiltersOpen(true)}
                        className="flex items-center gap-2 text-xs uppercase tracking-[0.15em]"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filter & Sort
                    </button>
                    <span className="text-xs text-gray-500">{totalProducts} Products</span>
                </div>

                {/* Mobile Filter Overlay */}
                {mobileFiltersOpen && (
                    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-lg font-light uppercase tracking-wider">Filter & Sort</h2>
                                <button onClick={() => setMobileFiltersOpen(false)}>
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Sort */}
                            <div className="mb-8">
                                <h3 className="text-xs uppercase tracking-[0.15em] font-medium mb-4">Sort By</h3>
                                <div className="space-y-3">
                                    {sortOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => updateFilter('sortBy', option.value)}
                                            className={`block text-sm ${
                                                filters.sortBy === option.value ? 'font-medium' : 'text-gray-600'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Audience */}
                            <div className="mb-8">
                                <h3 className="text-xs uppercase tracking-[0.15em] font-medium mb-4">Audience</h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'All', value: '' },
                                        { label: 'Men', value: 'men' },
                                        { label: 'Women', value: 'women' },
                                        { label: 'Kids', value: 'kids' },
                                        { label: 'Unisex', value: 'unisex' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => updateFilter('audience', opt.value)}
                                            className={`block text-sm ${
                                                filters.audience === opt.value ? 'font-medium' : 'text-gray-600'
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category */}
                            <div className="mb-8">
                                <h3 className="text-xs uppercase tracking-[0.15em] font-medium mb-4">Category</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => updateFilter('category', '')}
                                        className={`block text-sm ${
                                            !filters.category ? 'font-medium' : 'text-gray-600'
                                        }`}
                                    >
                                        All Categories
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.slug}
                                            onClick={() => updateFilter('category', cat.slug)}
                                            className={`block text-sm ${
                                                filters.category === cat.slug ? 'font-medium' : 'text-gray-600'
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price */}
                            <div className="mb-8">
                                <h3 className="text-xs uppercase tracking-[0.15em] font-medium mb-4">Price</h3>
                                <div className="space-y-3">
                                    {priceRanges.map((range) => (
                                        <button
                                            key={range.value}
                                            onClick={() => updateFilter('priceRange', range.value)}
                                            className={`block text-sm ${
                                                filters.priceRange === range.value ? 'font-medium' : 'text-gray-600'
                                            }`}
                                        >
                                            {range.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Apply Button */}
                            <button
                                onClick={() => setMobileFiltersOpen(false)}
                                className="w-full bg-brand-primary text-white py-4 text-xs uppercase tracking-wider"
                            >
                                View Results ({totalProducts})
                            </button>

                            {hasActiveFilters && (
                                <button
                                    onClick={() => {
                                        clearFilters()
                                        setMobileFiltersOpen(false)
                                    }}
                                    className="w-full mt-3 py-4 text-xs uppercase tracking-wider border border-gray-300"
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
