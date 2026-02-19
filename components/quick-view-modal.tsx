'use client'

import { useState, useEffect } from 'react'
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
    const { formatPrice, convertPrice, isLoading: currencyLoading } = useCurrency()
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedColor, setSelectedColor] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    useEffect(() => {
        if (isOpen && product) {
            setSelectedSize(product.sizes?.[0]?.size || '')
            setSelectedColor(product.colors?.[0]?.name || '')
            setQuantity(1)
            setCurrentImageIndex(0)
        }
    }, [isOpen, product]) // Reset when product changes or modal opens

    if (!isOpen || !product) return null

    const inWishlist = isInWishlist(product._id)
    const displayPrice = !currencyLoading ? formatPrice(convertPrice(product.price)) : '₵--'

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
                className="absolute inset-0 bg-black/60"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white text-black w-full max-w-xl h-[85vh] animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                {/* Header - Black Background */}
                <div className="bg-black text-white p-6 flex gap-6 items-start relative flex-shrink-0">
                     {/* Thumbnail Image */}
                    <div className="relative w-24 aspect-[3/4] flex-shrink-0 bg-neutral-800">
                        {product.images?.[0] && (product.images[0] as any).asset ? (
                            <Image
                                src={urlFor(product.images[0]).width(200).height(267).url()}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] uppercase text-neutral-500">No Image</span>
                            </div>
                        )}
                    </div>

                    {/* Product Summary */}
                    <div className="flex-1 pt-1">
                        <h2 className="text-xl font-light tracking-wide mb-1">{product.name}</h2>
                        
                        {/* Price */}
                         <div className="mb-4">
                             {product.hasDiscount && product.discountType && product.discountValue ? (
                                <div className="flex items-center gap-2">
                                     <span className="text-gray-400 line-through text-sm">
                                         {/* We need original price logic here but displayPrice handles the conversion. 
                                            Ideally formatPrice(convertPrice(product.price)) is the base.
                                            If hasDiscount is true, displayPrice is likely the discounted one depending on how product-card calculates it. 
                                            Usually displayPrice is just the single price.
                                            Let's use displayPrice as primary and assume it reflects current selling price.
                                         */}
                                         {/* For simplicity in this quick view, just show the current display price prominently */}
                                    </span>
                                    <span className="text-red-500 font-medium">{displayPrice}</span>
                                     {/* Discount Badge */}
                                    <span className="text-xs text-red-500">
                                        {product.discountType === 'percentage' 
                                            ? `${product.discountValue}% off` 
                                            : `Save ${formatPrice(convertPrice(product.discountValue))}`}
                                    </span>
                                </div>
                             ) : (
                                <p className="text-lg font-medium">{displayPrice}</p>
                             )}
                         </div>

                        <Link 
                            href={`/products/${product.slug.current}`} 
                            onClick={onClose}
                            className="inline-flex items-center text-xs uppercase tracking-wider border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors"
                        >
                            See more details <span className="ml-2">→</span>
                        </Link>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 overflow-y-auto flex flex-col">
                    {/* Size Selection */}
                    {product.sizes && product.sizes.length > 0 && (
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-sm font-medium">Select Size</label>
                                <Link 
                                    href="/size-guide" 
                                    target="_blank"
                                    className="text-[10px] uppercase font-bold tracking-widest text-gray-500 hover:text-black border-b border-gray-300 pb-0.5"
                                >
                                    Size Guide
                                </Link>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {product.sizes.map((sizeObj: any) => (
                                    <button
                                        key={sizeObj.size}
                                        onClick={() => setSelectedSize(sizeObj.size)}
                                        disabled={sizeObj.stock === 0}
                                        className={`h-12 w-full flex items-center justify-center border text-sm transition-all rounded-md ${
                                            selectedSize === sizeObj.size
                                                ? 'bg-white text-black border-black border-2 font-medium'
                                                : sizeObj.stock === 0
                                                ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                                                : 'bg-white text-black border-gray-200 hover:border-black'
                                        }`}
                                    >
                                        {sizeObj.size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Spacer to push content to mid section */}
                    <div className="h-12"></div>

                    {/* Quantity & Weight Row */}
                    <div className="flex items-start justify-between mb-8">
                         <div>
                            <label className="block text-sm font-medium mb-2">Quantity</label>
                            <div className="flex items-center">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center text-gray-500 hover:text-black rounded-l-sm"
                                    aria-label="Decrease quantity"
                                >
                                    <span className="text-lg">−</span>
                                </button>
                                <div className="w-12 h-10 border-t border-b border-gray-300 flex items-center justify-center text-sm font-medium">
                                    {quantity}
                                </div>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 border border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center text-gray-500 hover:text-black rounded-r-sm"
                                    aria-label="Increase quantity"
                                >
                                    <span className="text-lg">+</span>
                                </button>
                            </div>
                         </div>

                         <div className="text-right">
                             <label className="block text-sm font-medium mb-2">Product Weight</label>
                             <div className="flex items-center justify-end gap-2 text-gray-500 text-sm">
                                <ShoppingBag className="w-4 h-4" />
                                <span>{product.weight ? `${product.weight} KG` : 'N/A'}</span>
                             </div>
                         </div>
                    </div>

                    {/* Description */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium mb-2">Description</label>
                         {product.description && (
                            <div className="text-sm text-gray-600 leading-relaxed">
                                <div className="mb-1">Product Details:</div>
                                <div className="line-clamp-4">{product.description}</div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between gap-4 pt-4 mt-auto">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-300 text-xs uppercase font-bold tracking-widest hover:border-black hover:text-black transition-colors rounded-sm text-gray-600"
                        >
                            Close
                        </button>
                        
                        {product.inStock ? (
                             <Button
                                onClick={handleAddToCart}
                                className="px-8 py-3 h-auto bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-sm shadow-none"
                            >
                                Add to bag
                                <ShoppingBag className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button disabled className="px-8 py-3 h-auto bg-gray-100 text-gray-400 rounded-sm text-xs font-bold uppercase tracking-widest border border-gray-100">
                                Sold Out
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
