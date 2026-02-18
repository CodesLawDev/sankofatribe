import { client, Product } from '@/lib/sanity'
import ProductGrid from '@/components/product-grid'

async function getCategoryProducts(categorySlug: string) {
    const query = `*[_type == "product" && $categorySlug in categories[]->slug.current] | order(_createdAt desc) {
    _id,
    name,
    slug,
    images,
    price,
    inStock,
    sizes[]{size, stock},
    weight,
    "categories": categories[]-> {
      _id,
      name,
      slug
    }
  }`

    const products = await client.fetch<Product[]>(query, { categorySlug }, { next: { revalidate: 60 } })
    return products
}

async function getCategoryName(categorySlug: string) {
    const query = `*[_type == "category" && slug.current == $categorySlug][0] { name }`
    const category = await client.fetch<{ name: string }>(query, { categorySlug })
    return category?.name || categorySlug
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const categoryName = await getCategoryName(params.slug)
    return {
        title: `${categoryName} - SANKOFA`,
        description: `Shop ${categoryName} collection from SANKOFA`,
    }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
    const products = await getCategoryProducts(params.slug)
    const categoryName = await getCategoryName(params.slug)

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-20">
            <div className="mb-16 text-center">
                <h1 className="text-2xl md:text-3xl font-light tracking-wider uppercase mb-3">
                    {categoryName}
                </h1>
                <p className="text-xs text-gray-600 tracking-wide">
                    {products.length} {products.length === 1 ? 'Item' : 'Items'}
                </p>
            </div>

            {products.length > 0 ? (
                <ProductGrid products={products} />
            ) : (
                <div className="text-center py-32">
                    <p className="text-sm text-gray-600 tracking-wide">No products in this category yet</p>
                </div>
            )}
        </div>
    )
}
