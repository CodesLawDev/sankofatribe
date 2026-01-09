'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Product } from './sanity'

export interface CartItem {
    id: string
    name: string
    price: number
    image: string
    quantity: number
    maxStock?: number
    selectedSize?: string
    selectedColor?: string
}

interface CartContextType {
    cart: CartItem[]
    addToCart: (item: Omit<CartItem, 'quantity'>, maxStock: number, quantity?: number) => Promise<boolean>
    removeFromCart: (id: string) => void
    updateQuantity: (id: string, quantity: number, maxStock: number) => Promise<boolean>
    clearCart: () => void
    cartTotal: number
    cartCount: number
    validateCartStock: () => Promise<{ valid: boolean; errors: string[] }>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([])

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const savedCart = localStorage.getItem('sankofatribe-cart')
                if (savedCart) {
                    setCart(JSON.parse(savedCart))
                }
            }
        } catch (error) {
            console.error('Failed to load cart from localStorage:', error)
        }
    }, [])

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem('sankofatribe-cart', JSON.stringify(cart))
            }
        } catch (error) {
            console.error('Failed to save cart to localStorage:', error)
        }
    }, [cart])

    const addToCart = async (item: Omit<CartItem, 'quantity'>, maxStock: number, quantity: number = 1) => {
        const existingItem = cart.find((i) => i.id === item.id && i.selectedSize === item.selectedSize && i.selectedColor === item.selectedColor)
        const requestedQuantity = existingItem ? existingItem.quantity + quantity : quantity

        // Check stock availability
        if (requestedQuantity > maxStock) {
            return false // Not enough stock
        }

        setCart((prevCart) => {
            const existingItem = prevCart.find((i) => i.id === item.id && i.selectedSize === item.selectedSize && i.selectedColor === item.selectedColor)
            if (existingItem) {
                return prevCart.map((i) =>
                    i.id === item.id && i.selectedSize === item.selectedSize && i.selectedColor === item.selectedColor
                        ? { ...i, quantity: i.quantity + quantity, maxStock }
                        : i
                )
            }
            return [...prevCart, { ...item, quantity, maxStock }]
        })

        return true // Successfully added
    }

    const removeFromCart = (id: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id))
    }

    const updateQuantity = async (id: string, quantity: number, maxStock: number) => {
        if (quantity <= 0) {
            removeFromCart(id)
            return true
        }

        // Check stock availability
        if (quantity > maxStock) {
            return false // Not enough stock
        }

        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === id ? { ...item, quantity, maxStock } : item
            )
        )

        return true
    }

    const clearCart = () => {
        setCart([])
    }

    // Validate entire cart stock before checkout
    const validateCartStock = async () => {
        const errors: string[] = []

        try {
            // Fetch current stock levels from Sanity for all cart items
            const productIds = [...new Set(cart.map(item => item.id))]
            
            if (productIds.length === 0) {
                return { valid: true, errors: [] }
            }

            const query = `*[_type == "product" && _id in $ids] {
                _id,
                name,
                sizes[] {
                    size,
                    stock
                },
                inStock
            }`
            
            const { client } = await import('./sanity')
            const products = await client.fetch<Array<{
                _id: string;
                name: string;
                sizes?: Array<{ size: string; stock: number }>;
                inStock?: boolean;
            }>>(query, { ids: productIds })
            
            // Create a map for quick lookup
            const productMap = new Map(products.map((p) => [p._id, p]))

            // Validate each cart item against live stock
            for (const item of cart) {
                const product = productMap.get(item.id)
                
                if (!product) {
                    errors.push(`${item.name} is no longer available`)
                    continue
                }

                if (!product.inStock) {
                    errors.push(`${item.name} is currently out of stock`)
                    continue
                }

                // Check specific size stock if size is selected
                if (item.selectedSize && product.sizes && product.sizes.length > 0) {
                    const sizeVariant = product.sizes.find((s: any) => 
                        s.size?.toLowerCase() === item.selectedSize?.toLowerCase()
                    )
                    
                    if (!sizeVariant) {
                        errors.push(`${item.name} - Size ${item.selectedSize} is no longer available`)
                        continue
                    }

                    const availableStock = sizeVariant.stock || 0
                    
                    if (availableStock === 0) {
                        errors.push(`${item.name} - Size ${item.selectedSize} is out of stock`)
                    } else if (item.quantity > availableStock) {
                        errors.push(
                            `${item.name} - Size ${item.selectedSize}: Only ${availableStock} available (you have ${item.quantity} in cart)`
                        )
                    }
                } else {
                    // If no size specified, check if there's any stock available
                    const totalStock = product.sizes?.reduce((sum: number, s: any) => sum + (s.stock || 0), 0) || 0
                    
                    if (totalStock === 0) {
                        errors.push(`${item.name} is out of stock`)
                    } else if (item.quantity > totalStock) {
                        errors.push(
                            `${item.name}: Only ${totalStock} available (you have ${item.quantity} in cart)`
                        )
                    }
                }
            }
        } catch (error) {
            console.error('Stock validation error:', error)
            errors.push('Unable to validate stock availability. Please try again.')
        }

        return {
            valid: errors.length === 0,
            errors
        }
    }

    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0)

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartTotal,
                cartCount,
                validateCartStock,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
