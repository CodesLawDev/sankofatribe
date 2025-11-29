'use client'

import Image from 'next/image'
import Link from 'next/link'
import { urlFor, Product } from '@/lib/sanity'

interface ProductCardProps {
    product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
    const imageUrl = product.images?.[0] 
        ? urlFor(product.images[0]).width(800).height(1000).url()
        : '/placeholder-product.png'

    return (
        <Link href={`/products/${product.slug.current}`} className="group block">
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
            <div className="space-y-2">
                <h3 className="text-xs uppercase tracking-[0.15em] font-medium text-brand-dark group-hover:opacity-60 transition-opacity">
                    {product.name}
                </h3>
                <p className="text-xs text-neutral-600">${product.price.toFixed(2)}</p>
            </div>
        </Link>
    )
}
