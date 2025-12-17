'use client'

import Image from 'next/image'
import Link from 'next/link'
import { urlFor, Product } from '@/lib/sanity'
import { Heart, Eye } from 'lucide-react'
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

    const handleQuickViewClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        onQuickView?.(product)
    }

    return (
        <div className="group block relative">
            <Link href={`/products/${product.slug.current}`}>
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-50 mb-4">
                    {product.images?.[0] ? (
                        <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.02]"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                            <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                                No Image
                            </span>
                        </div>
                    )}
                    {!product.inStock && (
                        <div className="absolute inset-0 bg-brand-cream/90 flex items-center justify-center">
                            <span className="text-xs uppercase tracking-[0.2em] font-medium">
                                Sold Out
                            </span>
                        </div>
                    )}

                    {/* Hover Actions */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                            onClick={handleWishlistClick}
                            className="p-2 bg-white/90 hover:bg-white transition-colors"
                            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current text-red-500' : ''}`} />
                        </button>
                        {onQuickView && (
                            <button
                                onClick={handleQuickViewClick}
                                className="p-2 bg-white/90 hover:bg-white transition-colors"
                                aria-label="Quick view"
                            >
                                <Eye className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </Link>
            <div className="space-y-2">
                <Link href={`/products/${product.slug.current}`}>
                    <h3 className="text-xs uppercase tracking-[0.15em] font-medium text-brand-dark group-hover:opacity-60 transition-opacity">
                        {product.name}
                    </h3>
                </Link>
                <p className="text-xs text-neutral-600">${product.price.toFixed(2)}</p>
            </div>
        </div>
    )
}
