'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ShoppingBag, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { Product, urlFor } from '@/lib/sanity'
import { useCart } from '@/lib/cart-context'
import { useWishlist } from '@/lib/wishlist-context'
import { Button } from './ui/button'
import { useCurrency } from '@/lib/currency-context'

interface QuickViewModalProps {
    product: Product | null
    isOpen: boolean
    onClose: () => void
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
    const { addToCart } = useCart()
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
    const { formatPrice, convertPrice } = useCurrency()
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedColor, setSelectedColor] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    if (!isOpen || !product) return null

    const inWishlist = isInWishlist(product._id)
    const displayPrice = formatPrice(convertPrice(product.price))

    const handleAddToCart = async () => {
        if (!selectedSize && product.sizes && product.sizes.length > 0) {
            return
        }

        const imageUrl = product.images?.[0] && (product.images[0] as any).asset
            ? urlFor(product.images[0]).width(800).height(1067).url()
            : '/placeholder-product.png'

        const success = await addToCart(
            {
                id: product._id,
                name: product.name,
                price: product.price,
                image: imageUrl,
                selectedSize: selectedSize || product.sizes?.[0]?.size || '',
                selectedColor: selectedColor || product.colors?.[0]?.name || '',
            },
            product.sizes?.find((s: any) => s.size === selectedSize)?.stock || 0,
            quantity
        )
        if (success) {
            onClose()
            setQuantity(1)
        }
    }

    const handleWishlistToggle = () => {
        if (inWishlist) {
            removeFromWishlist(product._id)
        } else {
            addToWishlist(product)
        }
    }

    const nextImage = () => {
        if (product.images && product.images.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
        }
    }

    const prevImage = () => {
        if (product.images && product.images.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white text-black w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 hover:opacity-60 transition-opacity"
                    aria-label="Close quick view"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="grid md:grid-cols-2">
                    {/* Image Section */}
                    <div className="relative aspect-[3/4] bg-neutral-50">
                        {product.images?.[currentImageIndex] && (product.images[currentImageIndex] as any).asset ? (
                            <Image
                                src={urlFor(product.images[currentImageIndex]).width(800).height(1067).url()}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                                    No Image
                                </span>
                            </div>
                        )}

                        {/* Image Navigation */}
                        {product.images && product.images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white transition-colors"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white transition-colors"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>

                                {/* Image Indicators */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {product.images.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`w-2 h-2 rounded-full transition-colors ${
                                                index === currentImageIndex ? 'bg-black' : 'bg-black/30'
                                            }`}
                                            aria-label={`Go to image ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="p-8 md:p-12">
                        <div className="mb-6">
                            <h2 className="text-xl md:text-2xl font-light tracking-wider uppercase mb-2">
                                {product.name}
                            </h2>
                            <p className="text-sm text-gray-600">{displayPrice}</p>
                        </div>

                        {product.description && (
                            <p className="text-sm text-gray-600 leading-relaxed mb-6 line-clamp-3">
                                {product.description}
                            </p>
                        )}

                        {/* Size Selection */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-xs font-medium mb-3 uppercase tracking-[0.15em]">
                                    Size
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map((sizeObj: any) => (
                                        <button
                                            key={sizeObj.size}
                                            onClick={() => setSelectedSize(sizeObj.size)}
                                            disabled={sizeObj.stock === 0}
                                            className={`px-4 py-2 border text-xs uppercase tracking-wider transition-all ${
                                                selectedSize === sizeObj.size
                                                    ? 'bg-black text-white border-black'
                                                    : sizeObj.stock === 0
                                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                    : 'bg-white text-black border-gray-300 hover:border-black'
                                            }`}
                                        >
                                            {sizeObj.size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Color Selection */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="mb-8">
                                <label className="block text-xs font-medium mb-3 uppercase tracking-[0.15em]">
                                    Color
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSelectedColor(color.name)}
                                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                                                selectedColor === color.name
                                                    ? 'border-black ring-2 ring-offset-2 ring-black'
                                                    : 'border-gray-200'
                                            }`}
                                            style={{ backgroundColor: color.hex }}
                                            title={color.name}
                                            aria-label={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selection */}
                        <div className="mb-8">
                            <label className="block text-xs font-medium mb-3 uppercase tracking-[0.15em]">
                                Quantity
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 border border-gray-300 hover:border-black transition-colors flex items-center justify-center text-sm"
                                    aria-label="Decrease quantity"
                                >
                                    −
                                </button>
                                <span className="w-12 text-center text-sm">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 border border-gray-300 hover:border-black transition-colors flex items-center justify-center text-sm"
                                    aria-label="Increase quantity"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            {product.inStock ? (
                                <Button
                                    onClick={handleAddToCart}
                                    size="lg"
                                    className="w-full"
                                >
                                    <ShoppingBag className="h-4 w-4 mr-2" />
                                    Add to Bag
                                </Button>
                            ) : (
                                <Button disabled size="lg" className="w-full">
                                    Sold Out
                                </Button>
                            )}

                            <button
                                onClick={handleWishlistToggle}
                                className="w-full py-3 border border-gray-300 text-xs uppercase tracking-wider hover:border-black transition-colors flex items-center justify-center gap-2"
                            >
                                <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
                                {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                            </button>
                        </div>

                        {/* View Full Details */}
                        <Link
                            href={`/products/${product.slug.current}`}
                            className="block mt-6 text-center text-xs uppercase tracking-wider underline hover:no-underline"
                            onClick={onClose}
                        >
                            View Full Details
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
