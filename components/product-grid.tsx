'use client'

import { useState } from 'react'
import { Product } from '@/lib/sanity'
import ProductCard from './product-card'
import QuickViewModal from './quick-view-modal'

interface ProductGridProps {
    products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16">
                {products.map((product) => (
                    <ProductCard
                        key={product._id}
                        product={product}
                        onQuickView={setQuickViewProduct}
                    />
                ))}
            </div>

            <QuickViewModal
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />
        </>
    )
}
