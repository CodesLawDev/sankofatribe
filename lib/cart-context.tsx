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
    addToCart: (item: Omit<CartItem, 'quantity'>, maxStock: number) => Promise<boolean>
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
        const savedCart = localStorage.getItem('sankofatribe-cart')
        if (savedCart) {
            setCart(JSON.parse(savedCart))
        }
    }, [])

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('sankofatribe-cart', JSON.stringify(cart))
    }, [cart])

    const addToCart = async (item: Omit<CartItem, 'quantity'>, maxStock: number) => {
        const existingItem = cart.find((i) => i.id === item.id)
        const requestedQuantity = existingItem ? existingItem.quantity + 1 : 1

        // Check stock availability
        if (requestedQuantity > maxStock) {
            return false // Not enough stock
        }

        setCart((prevCart) => {
            const existingItem = prevCart.find((i) => i.id === item.id)
            if (existingItem) {
                return prevCart.map((i) =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1, maxStock } : i
                )
            }
            return [...prevCart, { ...item, quantity: 1, maxStock }]
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

        for (const item of cart) {
            if (item.quantity > (item.maxStock || 0)) {
                const available = item.maxStock || 0
                if (available === 0) {
                    errors.push(`${item.name} is out of stock`)
                } else {
                    errors.push(`${item.name}: Only ${available} available (you have ${item.quantity} in cart)`)
                }
            }
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
