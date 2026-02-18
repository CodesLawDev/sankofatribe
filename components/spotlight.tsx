'use client'

import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity'
import { Product } from '@/lib/sanity'
import { useCurrency } from '@/lib/currency-context'

interface SpotlightProps {
    products: Product[]
}

export default function Spotlight({ products }: SpotlightProps) {
    const { formatPrice, convertPrice, isLoading: currencyLoading } = useCurrency()

    return (
        <section className="py-20 md:py-32 bg-white">
            <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">Spotlight</h2>
                    <p className="text-gray-600 text-lg">
                        Discover our latest collections and timeless essentials
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => {
                        const imageUrl = product.images?.[0] && (product.images[0] as any).asset
                            ? urlFor(product.images[0]).width(500).height(666).url()
                            : '/placeholder-product.png'

                        return (
                            <Link key={product._id} href={`/products/${product.slug.current}`}>
                                <div className="group">
                                    <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-4 rounded-lg">
                                        <Image
                                            src={imageUrl}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <h3 className="text-sm font-semibold mb-1 group-hover:opacity-70 transition-opacity">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">{!currencyLoading ? formatPrice(convertPrice(product.price)) : '₵--'}</p>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
