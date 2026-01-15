'use client'

import Image from 'next/image'
import Link from 'next/link'
import { urlFor, Product } from '@/lib/sanity'
import { Heart, ShoppingBag, Plus, Minus } from 'lucide-react'
import { useWishlist } from '@/lib/wishlist-context'
import { useCart } from '@/lib/cart-context'
import { useState } from 'react'
import { useToast } from '@/components/toast-container'
import { useCurrency } from '@/lib/currency-context'

interface ProductCardProps {
    product: Product
    onQuickView?: (product: Product) => void
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
    const { addToCart } = useCart()
    const { showToast } = useToast()
    const { formatPrice, convertPrice } = useCurrency()
    const inWishlist = isInWishlist(product._id)
    const [showOptions, setShowOptions] = useState(false)
    const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]?.size || '')
    const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || '')
    const [quantity, setQuantity] = useState(1)

    const imageUrl = product.images?.[0] && (product.images[0] as any).asset
        ? urlFor(product.images[0]).width(800).height(1000).url()
        : '/placeholder-product.png'

    const getStockForSize = (size: string) => {
        return product.sizes?.find((s: any) => s.size === size)?.stock || 0
    }

    const selectedSizeStock = getStockForSize(selectedSize)
    const isSizeOutOfStock = selectedSizeStock === 0
    const displayPrice = formatPrice(convertPrice(product.price))

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (inWishlist) {
            removeFromWishlist(product._id)
        } else {
            addToWishlist(product)
        }
    }

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!selectedSize && product.sizes && product.sizes.length > 0) {
            showToast('Please select a size', 'error')
            return
        }

        if (quantity > selectedSizeStock) {
            showToast(`Not enough stock. Only ${selectedSizeStock} available.`, 'error')
            return
        }

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
            setShowOptions(false)
            setQuantity(1)
        } else {
            showToast(`Not enough stock in size ${selectedSize}.`, 'error')
        }
    }

    return (
        <div className="group block">
            <Link href={`/products/${product.slug.current}`}>
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-6">
                    {product.images?.[0] ? (
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <span className="text-xs text-gray-400">No Image</span>
                        </div>
                    )}
                    
                    {!product.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">Sold Out</span>
                        </div>
                    )}

                    {/* Wishlist Button - Always Visible on Desktop, Hover on Mobile */}
                    <div className="absolute top-4 right-4">
                        <button
                            onClick={handleWishlistClick}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-sm md:opacity-0 group-hover:opacity-100 md:group-hover:opacity-100"
                            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            <Heart 
                                className={`h-5 w-5 transition-colors ${
                                    inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
                                }`} 
                            />
                        </button>
                    </div>
                </div>
            </Link>

            <div className="space-y-1">
                <Link href={`/products/${product.slug.current}`}>
                    <h3 className="text-sm font-medium text-black group-hover:text-gray-600 transition-colors line-clamp-2">
                        {product.name}
                    </h3>
                </Link>
                
                {/* Categories */}
                {product.categories && product.categories.length > 0 && (
                    <p className="text-xs text-gray-600">
                        {product.categories.map((cat: any) => cat.name).join(', ')}
                    </p>
                )}
                
                {/* Price */}
                <div className="pt-1">
                    <p className="text-sm font-semibold text-black">{displayPrice}</p>
                </div>

                {/* Stock Indicator */}
                <div className="pt-1">
                    {product.inStock ? (
                        <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                            In Stock
                        </div>
                    ) : (
                        <div className="text-xs text-red-600 font-medium flex items-center gap-1">
                            <span className="inline-block w-2 h-2 bg-red-600 rounded-full"></span>
                            Out of stock
                        </div>
                    )}
                </div>

                {/* Size Stock Indicator - Show only when sizes have varied stock */}
                {product.sizes && product.sizes.length > 0 && product.inStock && (
                    <div className="text-xs text-gray-600 pt-1">
                        <div className="flex flex-wrap gap-2">
                            {product.sizes.map((sizeObj: any, idx: number) => (
                                <span key={`${sizeObj.size}-${idx}`} className={`px-2 py-0.5 rounded text-xs ${
                                    sizeObj.stock > 5 
                                        ? 'bg-green-100 text-green-700'
                                        : sizeObj.stock > 0
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {sizeObj.size}: {sizeObj.stock}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Size/Color/Quantity Options */}
                {showOptions && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-in fade-in-50 duration-200">
                        {/* Size Selection */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div>
                                <label className="text-xs font-medium uppercase block mb-2">Size</label>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map((sizeObj: any) => (
                                        <button
                                            key={sizeObj.size}
                                            onClick={() => setSelectedSize(sizeObj.size)}
                                            disabled={sizeObj.stock === 0}
                                            className={`px-3 py-2 border text-xs uppercase transition-all ${
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
                            <div>
                                <label className="text-xs font-medium uppercase block mb-2">Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSelectedColor(color.name)}
                                            className={`px-3 py-2 border text-xs transition-all ${
                                                selectedColor === color.name
                                                    ? 'bg-black text-white border-black'
                                                    : 'bg-white text-black border-gray-300 hover:border-black'
                                            }`}
                                            style={{
                                                borderLeftWidth: '3px',
                                                borderLeftColor: color.hex,
                                            }}
                                        >
                                            {color.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selection */}
                        <div>
                            <label className="text-xs font-medium uppercase block mb-2">Quantity</label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        setQuantity(Math.max(1, quantity - 1))
                                    }}
                                    className="w-8 h-8 border border-gray-300 hover:border-black flex items-center justify-center transition-colors"
                                >
                                    <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-8 text-center text-sm">{quantity}</span>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        if (quantity < selectedSizeStock) {
                                            setQuantity(quantity + 1)
                                        }
                                    }}
                                    disabled={quantity >= selectedSizeStock}
                                    className="w-8 h-8 border border-gray-300 hover:border-black flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Plus className="h-3 w-3" />
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={!product.inStock || isSizeOutOfStock || !selectedSize}
                            className="w-full mt-3 py-2 bg-black text-white text-xs uppercase font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            Add to Bag
                        </button>
                    </div>
                )}

                {/* Quick Add Toggle Button */}
                {product.inStock && (
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setShowOptions(!showOptions)
                        }}
                        className="w-full mt-3 py-2 bg-gray-100 text-black text-xs uppercase font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 md:opacity-0 group-hover:opacity-100"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        Quick Add
                    </button>
                )}
            </div>
        </div>
    )
}
