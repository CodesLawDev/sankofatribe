'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Product } from './sanity'

export interface CartItem {
    product: Product
    quantity: number
    selectedSize?: string
    selectedColor?: string
}

interface CartContextType {
    items: CartItem[]
    addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void
    removeFromCart: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
    totalItems: number
    totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
            setItems(JSON.parse(savedCart))
        }
    }, [])

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items))
    }, [items])

    const addToCart = (
        product: Product,
        quantity = 1,
        size?: string,
        color?: string
    ) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find(
                (item) =>
                    item.product._id === product._id &&
                    item.selectedSize === size &&
                    item.selectedColor === color
            )

            if (existingItem) {
                return prevItems.map((item) =>
                    item.product._id === product._id &&
                        item.selectedSize === size &&
                        item.selectedColor === color
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            }

            return [
                ...prevItems,
                {
                    product,
                    quantity,
                    selectedSize: size,
                    selectedColor: color,
                },
            ]
        })
    }

    const removeFromCart = (productId: string) => {
        setItems((prevItems) => prevItems.filter((item) => item.product._id !== productId))
    }

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId)
            return
        }

        setItems((prevItems) =>
            prevItems.map((item) =>
                item.product._id === productId ? { ...item, quantity } : item
            )
        )
    }

    const clearCart = () => {
        setItems([])
    }

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    )

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
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
