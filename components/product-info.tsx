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

interface ProductInfoProps {
    product: Product
}

export default function ProductInfo({ product }: ProductInfoProps) {
    const { addToCart } = useCart()
    const { showToast } = useToast()
    const { addToRecentlyViewed } = useRecentlyViewed()
    const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '')
    const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '')
    const [quantity, setQuantity] = useState(1)
    const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

    // Add to recently viewed on mount
    useEffect(() => {
        addToRecentlyViewed(product)
    }, [product, addToRecentlyViewed])

    const handleAddToCart = async () => {
        const imageUrl = product.images?.[0]
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
            product.stockQuantity || 0
        )

        if (success) {
            showToast(`${product.name} added to cart!`, 'success')
        } else {
            showToast(`Not enough stock for ${product.name}.`, 'error')
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
                    <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>
                            {/* Mock rating - would come from reviews */}
                            <StarRating rating={4.5} size="sm" showNumber />
                        </div>
                    
                        {/* Stock Status */}
                        {product.stockQuantity && product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                            <p className="text-xs text-red-600 font-medium">
                                Only {product.stockQuantity} left in stock - order soon!
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
                            {product.sizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`px-6 py-3 border text-xs uppercase tracking-wider transition-all ${
                                        selectedSize === size
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-black border-gray-300 hover:border-black'
                                    }`}
                                >
                                    {size}
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
                        disabled={!product.inStock}
                        className="w-full"
                    >
                        {product.inStock ? 'Add to Bag' : 'Out of Stock'}
                    </Button>
                    <Button
                        size="lg"
                        variant="secondary"
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
                    <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        <span>Size & fit help</span>
                    </div>
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
