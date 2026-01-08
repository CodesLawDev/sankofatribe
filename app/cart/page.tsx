'use client'

import { useCart } from '@/lib/cart-context'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { X, Minus, Plus } from 'lucide-react'
import CheckoutProgress from '@/components/checkout-progress'

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart()

    if (cart.length === 0) {
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
                <CheckoutProgress currentStep={1} />
            <h1 className="text-xl md:text-2xl font-light tracking-wider uppercase mb-12">Shopping Bag ({cartCount})</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-8">
                    {cart.map((item) => {

                        return (
                            <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-6 border-b border-gray-100 pb-8">
                                {/* Product Image */}
                                <div className="relative w-28 h-36 md:w-32 md:h-44 bg-gray-50 flex-shrink-0">
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                </div>

                                {/* Product Details */}
                                <div className="flex-grow">
                                    <div className="flex justify-between mb-3">
                                        <div>
                                            <h3 className="text-sm uppercase tracking-wide font-medium">{item.name}</h3>
                                            {item.selectedSize && (
                                                <p className="text-xs text-gray-600 mt-1">Size: {item.selectedSize}</p>
                                            )}
                                            {item.selectedColor && (
                                                <p className="text-xs text-gray-600">Color: {item.selectedColor}</p>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium">${item.price.toFixed(2)}</p>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center justify-between mt-6">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.maxStock || 0)}
                                                    className="w-8 h-8 border border-gray-300 hover:border-black focus:ring-2 focus:ring-brand-primary flex items-center justify-center transition-colors"
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-10 text-center text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.maxStock || 0)}
                                                    className="w-8 h-8 border border-gray-300 hover:border-black focus:ring-2 focus:ring-brand-primary flex items-center justify-center transition-colors"
                                                aria-label="Increase quantity"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                                className="text-red-600 hover:text-red-700 focus:ring-2 focus:ring-red-500 flex items-center gap-2 text-xs uppercase tracking-wide transition-colors rounded px-2 py-1"
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
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span>{cartTotal > 100 ? 'FREE' : '$10.00'}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between font-medium text-base">
                                    <span>Total</span>
                                    <span>${(cartTotal + (cartTotal > 100 ? 0 : 10)).toFixed(2)}</span>
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

                        {cartTotal < 100 && (
                            <p className="text-xs text-gray-500 mt-6 text-center">
                                Add ${(100 - cartTotal).toFixed(2)} more for free shipping
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
