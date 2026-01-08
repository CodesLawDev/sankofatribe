'use client'

import Image from 'next/image'
import Link from 'next/link'
import { urlFor, Product } from '@/lib/sanity'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/lib/wishlist-context'

interface ProductCardProps {
    product: Product
    onQuickView?: (product: Product) => void
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
    const inWishlist = isInWishlist(product._id)

    const imageUrl = product.images?.[0] 
        ? urlFor(product.images[0]).width(800).height(1000).url()
        : '/placeholder-product.png'

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (inWishlist) {
            removeFromWishlist(product._id)
        } else {
            addToWishlist(product)
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
                
                {/* Category/Type */}
                {product.category && (
                    <p className="text-xs text-gray-600">{product.category.name}</p>
                )}
                
                {/* Price */}
                <div className="pt-1">
                    <p className="text-sm font-semibold text-black">${product.price.toFixed(2)}</p>
                </div>

                {/* Stock Indicator */}
                {product.inStock && product.stockQuantity && product.stockQuantity <= 3 && (
                    <p className="text-xs text-red-600 font-medium pt-1">
                        Only {product.stockQuantity} left
                    </p>
                )}
            </div>
        </div>
    )
}
