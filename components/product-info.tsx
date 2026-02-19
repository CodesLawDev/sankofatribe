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
                <div className="space-y-3">
                    <h1 className="text-2xl md:text-3xl font-light tracking-wider uppercase">{product.name}</h1>
                        <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-600">{displayPrice}</p>
                            {/* Mock rating - would come from reviews */}
                            <StarRating rating={4.5} size="sm" showNumber />
                        </div>
                    
                        {/* Stock Status */}
                        {selectedSizeStock && selectedSizeStock <= 5 && selectedSizeStock > 0 && (
                            <p className="text-xs text-red-600 font-medium">
                                Only {selectedSizeStock} left in size {selectedSize} - order soon!
                            </p>
                        )}
                        {isSizeOutOfStock && (
                            <p className="text-xs text-red-600 font-medium">
                                Out of stock in size {selectedSize}
                            </p>
                        )}
                </div>

                {product.description && (
                    <div className="border-t border-gray-100 pt-6">
                        <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
                    </div>
                )}

                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                    <div className="border-t border-gray-100 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-xs font-medium uppercase tracking-[0.2em]">
                                    Select Size
                                </label>
                                <button
                                    onClick={() => setSizeGuideOpen(true)}
                                    className="flex items-center gap-1 text-xs text-brand-primary hover:underline"
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
                                    className={`px-6 py-3 border text-xs uppercase tracking-wider transition-all relative ${
                                        selectedSize === sizeObj.size
                                            ? 'bg-black text-white border-black'
                                            : sizeObj.stock === 0
                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                            : 'bg-white text-black border-gray-300 hover:border-black'
                                    }`}
                                >
                                    {sizeObj.size}
                                    {sizeObj.stock < 10 && sizeObj.stock > 0 && (
                                        <span className="text-[10px] text-gray-500 block">({sizeObj.stock} left)</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Color Selection */}
                {product.colors && product.colors.length > 0 && (
                    <div className="border-t border-gray-100 pt-6">
                        <label className="block text-xs font-medium mb-4 uppercase tracking-[0.2em]">
                            Select Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {product.colors.map((color) => (
                                <button
                                    key={color.name}
                                    onClick={() => setSelectedColor(color.name)}
                                    className={`px-6 py-3 border text-xs transition-all ${
                                        selectedColor === color.name
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-black border-gray-300 hover:border-black'
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
                <div className="border-t border-gray-100 pt-6">
                    <label className="block text-xs font-medium mb-4 uppercase tracking-[0.2em]">
                        Quantity
                    </label>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 h-10 border border-gray-300 hover:border-black focus:ring-2 focus:ring-brand-primary transition-colors text-sm"
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>
                        <span className="w-12 text-center text-sm">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-10 h-10 border border-gray-300 hover:border-black focus:ring-2 focus:ring-brand-primary transition-colors text-sm"
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
                        className="w-full"
                    >
                        {!product.inStock ? 'Out of Stock' : isSizeOutOfStock ? `Out of Stock in ${selectedSize}` : 'Add to Bag'}
                    </Button>
                    <Button
                        size="lg"
                        variant="secondary"
                        onClick={handleBuyNow}
                        disabled={!product.inStock || isSizeOutOfStock || !selectedSize}
                        className="w-full"
                    >
                        Buy Now
                    </Button>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-neutral-700">
                    <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <span>Free shipping over $100</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <RotateCcw className="h-4 w-4" />
                        <span>30-day easy returns</span>
                    </div>
                    <Link href="/size-guide" className="flex items-center gap-2 hover:text-brand-primary transition-colors">
                        <Ruler className="h-4 w-4" />
                        <span>Size & fit help</span>
                    </Link>
                </div>

                <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />

                {/* Product Details */}
                <div className="border-t border-gray-100 pt-6 space-y-4 text-xs">
                    <details className="group">
                        <summary className="cursor-pointer font-medium uppercase tracking-[0.2em] list-none flex items-center justify-between py-2">
                            <span>Shipping & Returns</span>
                            <span className="group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <p className="mt-3 text-gray-600 leading-relaxed pb-2">
                            Free standard shipping on orders over $100. Returns accepted within 30 days of purchase.
                        </p>
                    </details>
                    <details className="group border-t border-gray-100">
                        <summary className="cursor-pointer font-medium uppercase tracking-[0.2em] list-none flex items-center justify-between py-2">
                            <span>Product Care</span>
                            <span className="group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <p className="mt-3 text-gray-600 leading-relaxed pb-2">
                            Machine wash cold. Tumble dry low. Iron on low heat if needed.
                        </p>
                    </details>
                </div>
            </div>
        </>
    )
}
