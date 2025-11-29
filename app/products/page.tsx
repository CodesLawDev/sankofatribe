import { client, Product } from '@/lib/sanity'
import ProductGrid from '@/components/product-grid'

async function getAllProducts() {
    const query = `*[_type == "product"] | order(_createdAt desc) {
    _id,
    name,
    slug,
    images,
    price,
    inStock,
    featured,
    "category": category-> {
      _id,
      name,
      slug
    }
  }`

    const products = await client.fetch<Product[]>(query, {}, { next: { revalidate: 60 } })
    return products
}

export const metadata = {
    title: 'All Products - SANKOFA',
    description: 'Browse all premium fashion products from SANKOFA',
}

export default async function ProductsPage() {
    const products = await getAllProducts()

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-20">
            <div className="mb-16 text-center">
                <h1 className="text-2xl md:text-3xl font-light tracking-wider uppercase mb-3">
                    All Products
                </h1>
                <p className="text-xs text-gray-600 tracking-wide">
                    {products.length} {products.length === 1 ? 'Item' : 'Items'}
                </p>
            </div>

            {products.length > 0 ? (
                <ProductGrid products={products} />
            ) : (
                <div className="text-center py-32">
                    <p className="text-sm text-gray-600 tracking-wide">No products available at the moment</p>
                </div>
            )}
        </div>
    )
}
