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
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const savedWishlist = localStorage.getItem('sankofatribe-wishlist')
                if (savedWishlist) {
                    setItems(JSON.parse(savedWishlist))
                }
            }
        } catch (error) {
            console.error('Error loading wishlist:', error)
        }
        setIsInitialized(true)
    }, [])

    // Save wishlist to localStorage whenever it changes
    useEffect(() => {
        if (isInitialized) {
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    localStorage.setItem('sankofatribe-wishlist', JSON.stringify(items))
                }
            } catch (error) {
                console.error('Error saving wishlist:', error)
            }
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
