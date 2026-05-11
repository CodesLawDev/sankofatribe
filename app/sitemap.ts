import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'

const BASE_URL = 'https://sankofatribe.com'

interface Product {
    slug: { current: string }
    _updatedAt: string
}

interface Category {
    slug: { current: string }
    _updatedAt: string
}

async function getProducts(): Promise<Product[]> {
    try {
        const query = `*[_type == "product"] { slug, _updatedAt }`
        const products = await client.fetch<Product[]>(query, {}, { next: { revalidate: 3600 } })
        return products
    } catch (error) {
        console.error('Failed to fetch products for sitemap:', error)
        return []
    }
}

async function getCategories(): Promise<Category[]> {
    try {
        const query = `*[_type == "category"] { slug, _updatedAt }`
        const categories = await client.fetch<Category[]>(query, {}, { next: { revalidate: 3600 } })
        return categories
    } catch (error) {
        console.error('Failed to fetch categories for sitemap:', error)
        return []
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticPages = [
        { url: `${BASE_URL}/`, priority: 1, changeFreq: 'daily' as const },
        { url: `${BASE_URL}/about`, priority: 0.8, changeFreq: 'weekly' as const },
        { url: `${BASE_URL}/contact`, priority: 0.8, changeFreq: 'weekly' as const },
        { url: `${BASE_URL}/events`, priority: 0.8, changeFreq: 'weekly' as const },
        { url: `${BASE_URL}/faq`, priority: 0.8, changeFreq: 'weekly' as const },
        { url: `${BASE_URL}/careers`, priority: 0.7, changeFreq: 'weekly' as const },
        { url: `${BASE_URL}/products`, priority: 0.9, changeFreq: 'daily' as const },
        { url: `${BASE_URL}/privacy`, priority: 0.5, changeFreq: 'monthly' as const },
        { url: `${BASE_URL}/terms`, priority: 0.5, changeFreq: 'monthly' as const },
        { url: `${BASE_URL}/returns`, priority: 0.7, changeFreq: 'monthly' as const },
        { url: `${BASE_URL}/shipping`, priority: 0.7, changeFreq: 'monthly' as const },
        { url: `${BASE_URL}/size-guide`, priority: 0.7, changeFreq: 'weekly' as const },
    ]

    const [products, categories] = await Promise.all([
        getProducts(),
        getCategories(),
    ])

    const productUrls = products.map((product) => ({
        url: `${BASE_URL}/products/${product.slug.current}`,
        lastModified: new Date(product._updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    const categoryUrls = categories.map((category) => ({
        url: `${BASE_URL}/category/${category.slug.current}`,
        lastModified: new Date(category._updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [
        ...staticPages.map(({ url, priority, changeFreq }) => ({
            url,
            lastModified: new Date(),
            changeFrequency: changeFreq,
            priority,
        })),
        ...productUrls,
        ...categoryUrls,
    ]
}
