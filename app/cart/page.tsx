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
                <div className="text-center glass-container p-8 rounded-xl">
                    <h1 className="text-2xl md:text-3xl font-light tracking-wider uppercase mb-6 text-slate-900 dark:text-white">Your Bag is Empty</h1>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-8 tracking-wide">Continue shopping to add items to your bag</p>
                    <Link href="/products">
                        <Button size="lg" className="btn-glass-primary rounded-lg">Shop Now</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-20">
                <CheckoutProgress currentStep={1} />
            <h1 className="text-xl md:text-2xl font-light tracking-wider uppercase mb-12 text-slate-900 dark:text-white">Shopping Bag ({cartCount})</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-8">
                    {cart.map((item) => {

                        return (
                            <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="glass-sm p-6 rounded-lg border-transparent flex gap-6">
                                {/* Product Image */}
                                <div className="relative w-28 h-36 md:w-32 md:h-44 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 flex-shrink-0 rounded-lg overflow-hidden">
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                </div>

                                {/* Product Details */}
                                <div className="flex-grow">
                                    <div className="flex justify-between mb-3">
                                        <div>
                                            <h3 className="text-sm uppercase tracking-wide font-medium text-slate-900 dark:text-white">{item.name}</h3>
                                            {item.selectedSize && (
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Size: {item.selectedSize}</p>
                                            )}
                                            {item.selectedColor && (
                                                <p className="text-xs text-slate-600 dark:text-slate-400">Color: {item.selectedColor}</p>
                                            )}
                                        </div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">GH₵{item.price.toFixed(2)}</p>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center justify-between mt-6">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.maxStock || 0, item.selectedSize, item.selectedColor)}
                                                    className="w-8 h-8 glass-sm rounded-lg hover:bg-white/30 dark:hover:bg-slate-700/50 focus:ring-2 focus:ring-amber-500 flex items-center justify-center transition-all text-slate-900 dark:text-white"
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-10 text-center text-sm text-slate-900 dark:text-white">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.maxStock || 0, item.selectedSize, item.selectedColor)}
                                                    className="w-8 h-8 glass-sm rounded-lg hover:bg-white/30 dark:hover:bg-slate-700/50 focus:ring-2 focus:ring-amber-500 flex items-center justify-center transition-all text-slate-900 dark:text-white"
                                                aria-label="Increase quantity"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 focus:ring-2 focus:ring-red-500 flex items-center gap-2 text-xs uppercase tracking-wide transition-colors rounded px-2 py-1"
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
                    <div className="glass-container p-8 sticky top-32 rounded-xl">
                        <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-8 text-slate-900 dark:text-white">Order Summary</h2>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                                <span className="text-slate-900 dark:text-white">GH₵{cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Shipping</span>
                                <span className="text-slate-900 dark:text-white">Calculated at checkout</span>
                            </div>
                            <div className="border-t border-white/20 dark:border-white/10 pt-4">
                                <div className="flex justify-between font-medium text-base text-slate-900 dark:text-white">
                                    <span>Total</span>
                                    <span>GH₵{cartTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <Link href="/checkout">
                            <Button size="lg" className="w-full mb-3 btn-glass-primary rounded-lg">
                                Checkout
                            </Button>
                        </Link>

                        <Link href="/products">
                            <Button size="lg" variant="secondary" className="w-full btn-glass-secondary rounded-lg">
                                Continue Shopping
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
