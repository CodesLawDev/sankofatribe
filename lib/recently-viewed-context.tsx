'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { Product } from './sanity'

interface RecentlyViewedContextType {
    recentlyViewed: Product[]
    addToRecentlyViewed: (product: Product) => void
    clearRecentlyViewed: () => void
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined)

const MAX_RECENT_ITEMS = 8
const STORAGE_KEY = 'sankofa_recently_viewed'

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
    const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                setRecentlyViewed(JSON.parse(stored))
            }
        } catch (error) {
            console.error('Failed to load recently viewed:', error)
        }
    }, [])

    const addToRecentlyViewed = useCallback((product: Product) => {
        setRecentlyViewed((prev) => {
            // Remove if already exists
            const filtered = prev.filter((p) => p._id !== product._id)
            // Add to beginning
            const updated = [product, ...filtered].slice(0, MAX_RECENT_ITEMS)
            
            // Save to localStorage
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
            } catch (error) {
                console.error('Failed to save recently viewed:', error)
            }
            
            return updated
        })
    }, [])

    const clearRecentlyViewed = useCallback(() => {
        setRecentlyViewed([])
        try {
            localStorage.removeItem(STORAGE_KEY)
        } catch (error) {
            console.error('Failed to clear recently viewed:', error)
        }
    }, [])

    return (
        <RecentlyViewedContext.Provider value={{ recentlyViewed, addToRecentlyViewed, clearRecentlyViewed }}>
            {children}
        </RecentlyViewedContext.Provider>
    )
}

export function useRecentlyViewed() {
    const context = useContext(RecentlyViewedContext)
    if (!context) {
        throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider')
    }
    return context
}
