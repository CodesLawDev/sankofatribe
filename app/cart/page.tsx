'use client'

import { useCart } from '@/lib/cart-context'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity'
import { Button } from '@/components/ui/button'
import { X, Minus, Plus } from 'lucide-react'

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart()

    if (items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-32">
                <div className="text-center">
                    <h1 className="text-2xl md:text-3xl font-light tracking-wider uppercase mb-6">Your Bag is Empty</h1>
                    <p className="text-xs text-gray-600 mb-8 tracking-wide">Continue shopping to add items to your bag</p>
                    <Link href="/products">
                        <Button size="lg">Shop Now</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-20">
            <h1 className="text-xl md:text-2xl font-light tracking-wider uppercase mb-12">Shopping Bag ({totalItems})</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-8">
                    {items.map((item) => {
                        const imageUrl = urlFor(item.product.images[0]).width(200).height(267).url()

                        return (
                            <div key={`${item.product._id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-6 border-b border-gray-100 pb-8">
                                {/* Product Image */}
                                <div className="relative w-28 h-36 md:w-32 md:h-44 bg-gray-50 flex-shrink-0">
                                    <Image
                                        src={imageUrl}
                                        alt={item.product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Product Details */}
                                <div className="flex-grow">
                                    <div className="flex justify-between mb-3">
                                        <div>
                                            <Link href={`/products/${item.product.slug.current}`}>
                                                <h3 className="text-sm uppercase tracking-wide font-medium hover:opacity-60 transition-opacity">{item.product.name}</h3>
                                            </Link>
                                            {item.selectedSize && (
                                                <p className="text-xs text-gray-600 mt-1">Size: {item.selectedSize}</p>
                                            )}
                                            {item.selectedColor && (
                                                <p className="text-xs text-gray-600">Color: {item.selectedColor}</p>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium">${item.product.price.toFixed(2)}</p>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center justify-between mt-6">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                                className="w-8 h-8 border border-gray-300 hover:border-black flex items-center justify-center transition-colors"
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-10 text-center text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                className="w-8 h-8 border border-gray-300 hover:border-black flex items-center justify-center transition-colors"
                                                aria-label="Increase quantity"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.product._id)}
                                            className="text-gray-600 hover:text-black flex items-center gap-2 text-xs uppercase tracking-wide transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-50 p-8 sticky top-32">
                        <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-8">Order Summary</h2>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span>{totalPrice > 100 ? 'FREE' : '$10.00'}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between font-medium text-base">
                                    <span>Total</span>
                                    <span>${(totalPrice + (totalPrice > 100 ? 0 : 10)).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <Link href="/checkout">
                            <Button size="lg" className="w-full mb-3">
                                Checkout
                            </Button>
                        </Link>

                        <Link href="/products">
                            <Button size="lg" variant="secondary" className="w-full">
                                Continue Shopping
                            </Button>
                        </Link>

                        {totalPrice < 100 && (
                            <p className="text-xs text-gray-500 mt-6 text-center">
                                Add ${(100 - totalPrice).toFixed(2)} more for free shipping
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
