'use client'

import { useState } from 'react'
import { Product } from '@/lib/sanity'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import ImageGallery from '@/components/image-gallery'

interface ProductInfoProps {
    product: Product
}

export default function ProductInfo({ product }: ProductInfoProps) {
    const { addToCart } = useCart()
    const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '')
    const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '')
    const [quantity, setQuantity] = useState(1)

    const handleAddToCart = () => {
        addToCart(product, quantity, selectedSize, selectedColor)
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
                    <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>
                </div>

                {product.description && (
                    <div className="border-t border-gray-100 pt-6">
                        <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
                    </div>
                )}

                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                    <div className="border-t border-gray-100 pt-6">
                        <label className="block text-xs font-medium mb-4 uppercase tracking-[0.2em]">
                            Select Size
                        </label>
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
                            className="w-10 h-10 border border-gray-300 hover:border-black transition-colors text-sm"
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>
                        <span className="w-12 text-center text-sm">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-10 h-10 border border-gray-300 hover:border-black transition-colors text-sm"
                            aria-label="Increase quantity"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="w-full"
                >
                    {product.inStock ? 'Add to Bag' : 'Out of Stock'}
                </Button>

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
