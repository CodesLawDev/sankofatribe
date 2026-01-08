'use client'

import { X } from 'lucide-react'

interface FilterChip {
    label: string
    value: string
    type: 'category' | 'priceRange'
}

interface ActiveFiltersProps {
    filters: FilterChip[]
    onRemove: (type: string, value: string) => void
    onClearAll: () => void
}

export default function ActiveFilters({ filters, onRemove, onClearAll }: ActiveFiltersProps) {
    if (filters.length === 0) return null

    return (
        <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-neutral-600 uppercase tracking-wider">Active Filters:</span>
            {filters.map((filter) => (
                <button
                    key={`${filter.type}-${filter.value}`}
                    onClick={() => onRemove(filter.type, filter.value)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-primary/10 text-brand-primary text-xs rounded-full hover:bg-brand-primary/20 transition-colors group"
                >
                    {filter.label}
                    <X className="h-3 w-3 group-hover:scale-110 transition-transform" />
                </button>
            ))}
            <button
                onClick={onClearAll}
                className="text-xs text-neutral-600 hover:text-brand-dark underline ml-2"
            >
                Clear All
            </button>
        </div>
    )
}
