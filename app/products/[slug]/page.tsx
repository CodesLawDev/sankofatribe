import { notFound } from 'next/navigation'
import { client, Product, urlFor } from '@/lib/sanity'
import ProductGrid from '@/components/product-grid'
import ProductInfo from '@/components/product-info'
import Breadcrumbs from '@/components/breadcrumbs'
import ProductReviews from '@/components/product-reviews'
import RecentlyViewed from '@/components/recently-viewed'

async function getProduct(slug: string) {
    const query = `*[_type == "product" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    images,
    description,
    price,
    sizes[]{size, stock},
    colors,
    inStock,
    soldCount,
    hasDiscount,
    discountType,
    discountValue,
    discountStartDate,
    discountEndDate,
    "categories": categories[]-> {
      _id,
      name,
      slug
    }
  }`

    const product = await client.fetch<Product>(query, { slug })
    return product
}

async function getRelatedProducts(categoryId: string, currentProductId: string) {
    const query = `*[_type == "product" && $categoryId in categories[]._ref && _id != $currentProductId][0...4] {
    _id,
    name,
    slug,
    images,
    price,
    sizes[]{size, stock},
    colors,
    inStock,
    hasDiscount,
    discountType,
    discountValue,
    discountStartDate,
    discountEndDate,
    "categories": categories[]-> {
      _id,
      name,
      slug
    }
  }`

    const products = await client.fetch<Product[]>(query, { categoryId, currentProductId })
    return products
}

async function getReviews(productId: string) {
    const query = `*[_type == "review" && product._ref == $productId] | order(publishedAt desc) {
        _id,
        author,
        rating,
        title,
        comment,
        verified,
        publishedAt
    }`
    const reviews = await client.fetch(query, { productId })
    return reviews
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const product = await getProduct(params.slug)
    if (!product) return { title: 'Product Not Found' }
    
    const title = `${product.name} - SANKOFA`
    const description = product.description || `Shop ${product.name} from SANKOFA`
    const imageUrl = product.images?.[0] ? urlFor(product.images[0]).width(1200).height(630).url() : '/og-image.png'
    const url = `https://sankofatribe.com/products/${product.slug.current}`
    
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: product.name,
                }
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
    const product = await getProduct(params.slug)

    if (!product) {
        notFound()
    }

    const reviews = await getReviews(product._id)
    const averageRating = reviews.length
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : 0

    const relatedProducts = product.categories && product.categories.length > 0
        ? await getRelatedProducts(product.categories[0]._id, product._id)
        : []

    const breadcrumbItems = [
        { label: 'Products', href: '/products' },
        ...(product.categories && product.categories.length > 0
            ? [{ label: product.categories[0].name, href: `/category/${product.categories[0].slug.current}` }]
            : []),
        { label: product.name },
    ]

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images?.[0] ? urlFor(product.images[0]).url() : '',
        description: product.description || `Buy ${product.name} at SANKOFA.`,
        offers: {
            '@type': 'Offer',
            url: `https://sankofatribe.com/products/${product.slug.current}`,
            priceCurrency: 'GHS',
            price: product.price,
            availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        }
    }

    return (
        <div className="bg-white text-black">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-16">
                <Breadcrumbs items={breadcrumbItems} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-32">
                    <ProductInfo product={product} />
                </div>

                <div className="mb-24">
                    <ProductReviews
                        reviews={reviews}
                        averageRating={averageRating}
                        totalReviews={reviews.length}
                        productId={product._id}
                    />
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] font-medium mb-12 text-center">You May Also Like</h2>
                        <ProductGrid products={relatedProducts} />
                    </section>
                )}

                <RecentlyViewed />
            </div>
        </div>
    )
}
