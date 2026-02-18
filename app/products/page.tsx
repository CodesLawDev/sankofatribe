import { client, Product } from '@/lib/sanity'
import ProductsWithFilters from '@/components/products-with-filters'

async function getAllProducts() {
    const query = `*[_type == "product"] | order(_createdAt desc) {
    _id,
    name,
    slug,
    images,
    price,
        audience,
    inStock,
    featured,
    sizes[]{size, stock},
    colors,
    soldCount,
    hasDiscount,
    discountType,
    discountValue,
    discountStartDate,
    discountEndDate,
    weight,
    "categories": categories[]-> {
      _id,
      name,
      slug
    }
  }`

    const products = await client.fetch<Product[]>(query, {}, { next: { revalidate: 60 } })
    return products
}

async function getCategories() {
    const query = `*[_type == "category"] | order(name asc) {
        name,
        "slug": slug.current
    }`
    const categories = await client.fetch<{ name: string; slug: string }[]>(query, {}, { next: { revalidate: 60 } })
    return categories
}

async function getCampaignBySlug(slug: string) {
    const query = `*[_type == "campaign" && slug.current == "${slug}"][0] {
        _id,
        name,
        slug,
        "includedProducts": includedProducts[]-> {_id, slug},
        "includedCategories": includedCategories[]-> {_id, slug}
    }`
    const campaign = await client.fetch(query, {}, { next: { revalidate: 300 } })
    return campaign
}

export const metadata = {
    title: 'All Products - SANKOFA',
    description: 'Browse all premium fashion products from SANKOFA',
}

export default async function ProductsPage({ searchParams }: { searchParams?: Record<string, string> }) {
    const [products, categories] = await Promise.all([
        getAllProducts(),
        getCategories()
    ])

    let campaignData = null
    if (searchParams?.campaign) {
        campaignData = await getCampaignBySlug(searchParams.campaign)
    }

    const initialFilters = {
        audience: (searchParams?.audience || '').toLowerCase(),
        category: (searchParams?.category || '').toLowerCase(),
        priceRange: (searchParams?.priceRange || ''),
        sortBy: (searchParams?.sortBy || 'newest'),
        campaign: (searchParams?.campaign || ''),
    }

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-12 md:py-20">
            <div className="mb-12 text-center">
                <h1 className="text-2xl md:text-3xl font-light tracking-wider uppercase mb-3">
                    {campaignData ? campaignData.name : 'All Products'}
                </h1>
            </div>

            <ProductsWithFilters products={products} categories={categories} initialFilters={initialFilters} campaignData={campaignData} />
        </div>
    )
}
