'use client'

import { useWishlist } from '@/lib/wishlist-context'
import { useCart } from '@/lib/cart-context'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity'
import { Button } from '@/components/ui/button'
import { X, ShoppingBag, Heart } from 'lucide-react'

export default function WishlistPage() {
    const { items, removeFromWishlist } = useWishlist()
    const { addToCart } = useCart()

    if (items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-32">
                <div className="text-center">
                    <Heart className="h-16 w-16 mx-auto mb-6 text-gray-300" strokeWidth={1} />
                    <h1 className="text-2xl md:text-3xl font-light tracking-wider uppercase mb-6">Your Wishlist is Empty</h1>
                    <p className="text-xs text-gray-600 mb-8 tracking-wide">Save items you love to your wishlist</p>
                    <Link href="/products">
                        <Button size="lg">Explore Products</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-20">
            <h1 className="text-xl md:text-2xl font-light tracking-wider uppercase mb-12 text-center">
                My Wishlist ({items.length} {items.length === 1 ? 'Item' : 'Items'})
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {items.map((product) => {
                    const imageUrl = product.images?.[0] && (product.images[0] as any).asset
                        ? urlFor(product.images[0]).width(600).height(800).url()
                        : '/placeholder-product.png'

                    return (
                        <div key={product._id} className="group relative">
                            {/* Remove Button */}
                            <button
                                onClick={() => removeFromWishlist(product._id)}
                                className="absolute top-3 right-3 z-10 p-2 bg-white/90 hover:bg-white transition-colors"
                                aria-label="Remove from wishlist"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            {/* Product Image */}
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
                                </div>
                            </Link>

                            {/* Product Info */}
                            <div className="space-y-2">
                                <Link href={`/products/${product.slug.current}`}>
                                    <h3 className="text-xs uppercase tracking-[0.15em] font-medium group-hover:opacity-60 transition-opacity">
                                        {product.name}
                                    </h3>
                                </Link>
                                <p className="text-xs text-neutral-600">${product.price.toFixed(2)}</p>

                                {/* Quick Add to Cart */}
                                {product.inStock && (
                                    <button
                                        onClick={async () => {
                                            const imageUrlForCart = product.images?.[0] && (product.images[0] as any).asset
                                                ? urlFor(product.images[0]).width(600).height(800).url()
                                                : '/placeholder-product.png'
                                            await addToCart(
                                                {
                                                    id: product._id,
                                                    name: product.name,
                                                    price: product.price,
                                                    image: imageUrlForCart,
                                                    selectedSize: product.sizes?.[0]?.size || '',
                                                    selectedColor: product.colors?.[0]?.name || '',
                                                },
                                                product.sizes?.[0]?.stock || 0
                                            )
                                        }}
                                        className="w-full mt-3 py-2 border border-brand-primary text-xs uppercase tracking-wider hover:bg-brand-primary hover:text-white transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ShoppingBag className="h-3 w-3" />
                                        Add to Bag
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
