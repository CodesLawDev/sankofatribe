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
    isLoading: boolean
    isAuthenticated: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<Product[]>([])
    const [isInitialized, setIsInitialized] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())

    // Check authentication and load wishlist
    useEffect(() => {
        const initializeWishlist = async () => {
            try {
                setIsLoading(true)

                // Check if user is authenticated
                const meResponse = await fetch('/api/auth/me')
                const isAuth = meResponse.ok

                if (isAuth) {
                    setIsAuthenticated(true)

                    // Load from database if authenticated
                    const response = await fetch('/api/customer/wishlist')
                    if (response.ok) {
                        const dbWishlist = await response.json()
                        // Store just the IDs for quick lookup
                        const ids = new Set<string>(dbWishlist.map((item: { productId: string }) => item.productId))
                        setWishlistIds(ids)
                        return
                    }
                } else {
                    setIsAuthenticated(false)
                }

                // Fallback to localStorage if not authenticated or API fails
                if (typeof window !== 'undefined' && window.localStorage) {
                    const savedWishlist = localStorage.getItem('sankofatribe-wishlist')
                    if (savedWishlist) {
                        try {
                            const parsed = JSON.parse(savedWishlist)
                            setItems(parsed)
                            // Extract IDs for quick lookup
                            setWishlistIds(new Set<string>(parsed.map((item: Product) => item._id)))
                        } catch (e) {
                            console.error('Error parsing saved wishlist:', e)
                        }
                    }
                }
            } catch (error) {
                console.error('Error initializing wishlist:', error)
                // Fallback to localStorage
                if (typeof window !== 'undefined' && window.localStorage) {
                    try {
                        const saved = localStorage.getItem('sankofatribe-wishlist')
                        if (saved) {
                            const parsed = JSON.parse(saved)
                            setItems(parsed)
                            setWishlistIds(new Set<string>(parsed.map((item: Product) => item._id)))
                        }
                    } catch (e) {
                        console.error('Error parsing fallback wishlist:', e)
                    }
                }
            } finally {
                setIsLoading(false)
                setIsInitialized(true)
            }
        }

        initializeWishlist()
    }, [])

    // Save to localStorage for offline access
    useEffect(() => {
        if (isInitialized && !isAuthenticated) {
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    localStorage.setItem('sankofatribe-wishlist', JSON.stringify(items))
                }
            } catch (error) {
                console.error('Error saving wishlist to localStorage:', error)
            }
        }
    }, [items, isInitialized, isAuthenticated])

    const addToWishlist = useCallback(async (product: Product) => {
        // Prevent duplicates
        if (wishlistIds.has(product._id)) {
            return
        }

        try {
            if (isAuthenticated) {
                // Add to database
                const response = await fetch('/api/customer/wishlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: product._id }),
                })

                if (!response.ok) {
                    throw new Error('Failed to add to wishlist')
                }

                // Update local state
                setWishlistIds(prev => new Set([...prev, product._id]))
                setItems(prev => [...prev, product])
            } else {
                // Just use localStorage for non-authenticated users
                setItems(prev => {
                    if (prev.find(item => item._id === product._id)) {
                        return prev
                    }
                    return [...prev, product]
                })
                setWishlistIds(prev => new Set([...prev, product._id]))
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error)
            // Fallback to local state
            setItems(prev => [...prev, product])
            setWishlistIds(prev => new Set([...prev, product._id]))
        }
    }, [isAuthenticated, wishlistIds])

    const removeFromWishlist = useCallback(async (productId: string) => {
        try {
            if (isAuthenticated) {
                // Remove from database
                const response = await fetch(`/api/customer/wishlist/${productId}`, {
                    method: 'DELETE',
                })

                if (!response.ok) {
                    throw new Error('Failed to remove from wishlist')
                }
            }

            // Update local state
            setItems(prev => prev.filter(item => item._id !== productId))
            setWishlistIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(productId)
                return newSet
            })
        } catch (error) {
            console.error('Error removing from wishlist:', error)
            // Fallback to local state
            setItems(prev => prev.filter(item => item._id !== productId))
            setWishlistIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(productId)
                return newSet
            })
        }
    }, [isAuthenticated])

    const isInWishlist = useCallback((productId: string) => {
        return wishlistIds.has(productId)
    }, [wishlistIds])

    const clearWishlist = useCallback(() => {
        setItems([])
        setWishlistIds(new Set())
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
                isLoading,
                isAuthenticated,
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
