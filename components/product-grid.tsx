import { Product } from '@/lib/sanity'
import ProductCard from './product-card'

interface ProductGridProps {
    products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16">
            {products.map((product) => (
                <ProductCard key={product._id} product={product} />
            ))}
        </div>
    )
}
