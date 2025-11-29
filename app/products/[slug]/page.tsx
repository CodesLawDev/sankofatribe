import { notFound } from 'next/navigation'
import { client, Product } from '@/lib/sanity'
import ProductGrid from '@/components/product-grid'
import ProductInfo from '@/components/product-info'

async function getProduct(slug: string) {
    const query = `*[_type == "product" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    images,
    description,
    price,
    sizes,
    colors,
    inStock,
    "category": category-> {
      _id,
      name,
      slug
    }
  }`

    const product = await client.fetch<Product>(query, { slug })
    return product
}

async function getRelatedProducts(categoryId: string, currentProductId: string) {
    const query = `*[_type == "product" && category._ref == $categoryId && _id != $currentProductId][0...4] {
    _id,
    name,
    slug,
    images,
    price,
    inStock
  }`

    const products = await client.fetch<Product[]>(query, { categoryId, currentProductId })
    return products
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
    const product = await getProduct(params.slug)

    if (!product) {
        notFound()
    }

    const relatedProducts = product.category
        ? await getRelatedProducts(product.category._id, product._id)
        : []

    return (
        <div className="bg-white">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-32">
                    <ProductInfo product={product} />
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] font-medium mb-12 text-center">You May Also Like</h2>
                        <ProductGrid products={relatedProducts} />
                    </section>
                )}
            </div>
        </div>
    )
}
