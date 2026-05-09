'use client'

import { useState } from 'react'
import { Product, urlFor } from '@/lib/sanity'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import ImageGallery from '@/components/image-gallery'
import { useToast } from '@/components/toast-container'
import { useRecentlyViewed } from '@/lib/recently-viewed-context'
import SizeGuideModal from '@/components/size-guide-modal'
import StarRating from '@/components/star-rating'
import { Ruler, Truck, RotateCcw } from 'lucide-react'
import { useEffect } from 'react'
import { useCurrency } from '@/lib/currency-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ProductInfoProps {
    product: Product
}

export default function ProductInfo({ product }: ProductInfoProps) {
    const { addToCart } = useCart()
    const { showToast } = useToast()
    const { addToRecentlyViewed } = useRecentlyViewed()
    const { formatPrice, convertPrice, isLoading: currencyLoading } = useCurrency()
    const router = useRouter()
    const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]?.size || '')
    const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '')
    const [quantity, setQuantity] = useState(1)
    const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

    // Add to recently viewed on mount
    useEffect(() => {
        addToRecentlyViewed(product)
    }, [product, addToRecentlyViewed])

    // Get stock for selected size
    const getStockForSize = (size: string) => {
        return product.sizes?.find((s: any) => s.size === size)?.stock || 0
    }

    const selectedSizeStock = getStockForSize(selectedSize)
    const isSizeOutOfStock = selectedSizeStock === 0
    const displayPrice = !currencyLoading ? formatPrice(convertPrice(product.price)) : '₵--'

    const handleAddToCart = async () => {
        if (!selectedSize) {
            showToast('Please select a size', 'error')
            return
        }

        const imageUrl = product.images?.[0] && (product.images[0] as any).asset
            ? urlFor(product.images[0]).width(800).height(1000).url()
            : '/placeholder-product.png'

        const success = await addToCart(
            {
                id: product._id,
                name: product.name,
                price: product.price,
                image: imageUrl,
                selectedSize,
                selectedColor,
            },
            selectedSizeStock,
            quantity
        )

        if (success) {
            showToast(`${quantity} × ${product.name} added to cart!`, 'success')
        } else {
            showToast(`Not enough stock in size ${selectedSize}.`, 'error')
        }
    }

    const handleBuyNow = async () => {
        if (!selectedSize) {
            showToast('Please select a size', 'error')
            return
        }

        const imageUrl = product.images?.[0] && (product.images[0] as any).asset
            ? urlFor(product.images[0]).width(800).height(1000).url()
            : '/placeholder-product.png'

        const success = await addToCart(
            {
                id: product._id,
                name: product.name,
                price: product.price,
                image: imageUrl,
                selectedSize,
                selectedColor,
            },
            selectedSizeStock,
            quantity
        )

        if (success) {
            // Redirect to checkout immediately
            router.push('/checkout')
        } else {
            showToast(`Not enough stock in size ${selectedSize}.`, 'error')
        }
    }

    return (
        <>
            {/* Image Gallery */}
            <div>
                <ImageGallery images={product.images} productName={product.name} />
            </div>

            {/* Product Info */}
            <div className="space-y-8 lg:pt-8">
                <div className="space-y-3 glass-sm p-4 rounded-lg">
                    <h1 className="text-2xl md:text-3xl font-light tracking-wider uppercase text-slate-900 dark:text-white">{product.name}</h1>
                        <div className="flex items-center gap-3">
                    <p className="text-sm text-slate-600 dark:text-slate-400">{displayPrice}</p>
                            {/* Mock rating - would come from reviews */}
                            <StarRating rating={4.5} size="sm" showNumber />
                        </div>
                    
                        {/* Stock Status */}
                        {selectedSizeStock && selectedSizeStock <= 5 && selectedSizeStock > 0 && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                Only {selectedSizeStock} left in size {selectedSize} - order soon!
                            </p>
                        )}
                        {isSizeOutOfStock && (
                            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                Out of stock in size {selectedSize}
                            </p>
                        )}
                </div>

                {product.description && (
                    <div className="glass-sm p-4 rounded-lg border-transparent">
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{product.description}</p>
                    </div>
                )}

                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                    <div className="glass-md p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-900 dark:text-white">
                                    Select Size
                                </label>
                                <button
                                    onClick={() => setSizeGuideOpen(true)}
                                    className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline"
                                >
                                    <Ruler className="h-3 w-3" />
                                    Size Guide
                                </button>
                            </div>
                        <div className="flex flex-wrap gap-2">
                            {product.sizes?.map((sizeObj: any) => (
                                <button
                                    key={sizeObj.size}
                                    onClick={() => setSelectedSize(sizeObj.size)}
                                    disabled={sizeObj.stock === 0}
                                    className={`px-6 py-3 glass text-xs uppercase tracking-wider transition-all rounded-lg ${
                                        selectedSize === sizeObj.size
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                                            : sizeObj.stock === 0
                                            ? 'glass-sm text-slate-400 dark:text-slate-500 border-transparent cursor-not-allowed opacity-50'
                                            : 'glass-sm text-slate-900 dark:text-white border-transparent hover:bg-white/40 dark:hover:bg-slate-700/50'
                                    }`}
                                >
                                    {sizeObj.size}
                                    {sizeObj.stock < 10 && sizeObj.stock > 0 && (
                                        <span className="text-[10px] text-slate-600 dark:text-slate-400 block">({sizeObj.stock} left)</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Color Selection */}
                {product.colors && product.colors.length > 0 && (
                    <div className="glass-md p-4 rounded-lg">
                        <label className="block text-xs font-medium mb-4 uppercase tracking-[0.2em] text-slate-900 dark:text-white">
                            Select Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {product.colors.map((color) => (
                                <button
                                    key={color.name}
                                    onClick={() => setSelectedColor(color.name)}
                                    className={`px-6 py-3 glass text-xs transition-all rounded-lg ${
                                        selectedColor === color.name
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                                            : 'glass-sm text-slate-900 dark:text-white border-transparent hover:bg-white/40 dark:hover:bg-slate-700/50'
                                    }`}
                                    style={{
                                        borderLeftWidth: '4px',
                                        borderLeftColor: color.hex,
                                    }}
                                >
                                    {color.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quantity */}
                <div className="glass-md p-4 rounded-lg">
                    <label className="block text-xs font-medium mb-4 uppercase tracking-[0.2em] text-slate-900 dark:text-white">
                        Quantity
                    </label>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 h-10 glass-sm rounded-lg hover:bg-white/30 dark:hover:bg-slate-700/50 focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 dark:text-white text-sm"
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>
                        <span className="w-12 text-center text-sm text-slate-900 dark:text-white">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-10 h-10 glass-sm rounded-lg hover:bg-white/30 dark:hover:bg-slate-700/50 focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 dark:text-white text-sm"
                            aria-label="Increase quantity"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Add to Cart Button */}
                <div className="space-y-3">
                    <Button
                        size="lg"
                        onClick={handleAddToCart}
                        disabled={!product.inStock || isSizeOutOfStock || !selectedSize}
                        className="w-full btn-glass-primary rounded-lg"
                    >
                        {!product.inStock ? 'Out of Stock' : isSizeOutOfStock ? `Out of Stock in ${selectedSize}` : 'Add to Bag'}
                    </Button>
                    <Button
                        size="lg"
                        variant="secondary"
                        onClick={handleBuyNow}
                        disabled={!product.inStock || isSizeOutOfStock || !selectedSize}
                        className="w-full btn-glass-secondary rounded-lg"
                    >
                        Buy Now
                    </Button>
                </div>

                {/* Safe Checkout & Payments */}
                <div className="pt-2 flex flex-col items-center justify-center gap-2">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">Secure Checkout With</p>
                    <div className="flex flex-wrap items-center justify-center gap-2 opacity-70">
                        <span className="text-[10px] font-semibold px-2 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800">MTN MoMo</span>
                        <span className="text-[10px] font-semibold px-2 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800">Telecel Cash</span>
                        <span className="text-[10px] font-semibold px-2 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800">VISA</span>
                        <span className="text-[10px] font-semibold px-2 py-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800">Mastercard</span>
                    </div>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="glass-sm p-3 rounded-lg flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Truck className="h-4 w-4 flex-shrink-0" />
                        <span>Free shipping over $100</span>
                    </div>
                    <div className="glass-sm p-3 rounded-lg flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <RotateCcw className="h-4 w-4 flex-shrink-0" />
                        <span>7-day easy returns</span>
                    </div>
                    <Link href="/size-guide" className="glass-sm p-3 rounded-lg flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                        <Ruler className="h-4 w-4 flex-shrink-0" />
                        <span>Size & fit help</span>
                    </Link>
                </div>

                <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />

                {/* Product Details */}
                <div className="glass-container space-y-0 rounded-lg overflow-hidden">
                    <details className="group glass-sm border-b border-white/20 dark:border-white/10">
                        <summary className="cursor-pointer font-medium uppercase tracking-[0.2em] list-none flex items-center justify-between py-4 px-4 text-slate-900 dark:text-white hover:bg-white/10 dark:hover:bg-slate-700/30 transition-colors">
                            <span>Shipping & Returns</span>
                            <span className="group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed pb-4 px-4">
                            Free standard shipping on orders over $100. Returns accepted within 7 days of purchase for ready-to-wear items. Custom orders are final sale.
                        </p>
                    </details>
                    <details className="group glass-sm">
                        <summary className="cursor-pointer font-medium uppercase tracking-[0.2em] list-none flex items-center justify-between py-4 px-4 text-slate-900 dark:text-white hover:bg-white/10 dark:hover:bg-slate-700/30 transition-colors">
                            <span>Product Care</span>
                            <span className="group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed pb-4 px-4">
                            Machine wash cold. Tumble dry low. Iron on low heat if needed.
                        </p>
                    </details>
                </div>
            </div>
        </>
    )
}
