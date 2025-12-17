'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Product } from './sanity'

interface WishlistContextType {
    items: Product[]
    addToWishlist: (product: Product) => void
    removeFromWishlist: (productId: string) => void
    isInWishlist: (productId: string) => boolean
    clearWishlist: () => void
    totalItems: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<Product[]>([])
    const [isInitialized, setIsInitialized] = useState(false)

    // Load wishlist from localStorage on mount
    useEffect(() => {
        const savedWishlist = localStorage.getItem('sankofa-wishlist')
        if (savedWishlist) {
            try {
                setItems(JSON.parse(savedWishlist))
            } catch (error) {
                console.error('Error parsing wishlist:', error)
            }
        }
        setIsInitialized(true)
    }, [])

    // Save wishlist to localStorage whenever it changes
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('sankofa-wishlist', JSON.stringify(items))
        }
    }, [items, isInitialized])

    const addToWishlist = useCallback((product: Product) => {
        setItems(prev => {
            if (prev.find(item => item._id === product._id)) {
                return prev
            }
            return [...prev, product]
        })
    }, [])

    const removeFromWishlist = useCallback((productId: string) => {
        setItems(prev => prev.filter(item => item._id !== productId))
    }, [])

    const isInWishlist = useCallback((productId: string) => {
        return items.some(item => item._id === productId)
    }, [items])

    const clearWishlist = useCallback(() => {
        setItems([])
    }, [])

    return (
        <WishlistContext.Provider
            value={{
                items,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                clearWishlist,
                totalItems: items.length,
            }}
        >
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    const context = useContext(WishlistContext)
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider')
    }
    return context
}
