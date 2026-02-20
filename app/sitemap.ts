import type { MetadataRoute } from 'next'

const BASE_URL = 'https://sankofatribe.com'

export default function sitemap(): MetadataRoute.Sitemap {
    const staticPages = [
        { url: `${BASE_URL}/`, priority: 1 },
        { url: `${BASE_URL}/about`, priority: 0.8 },
        { url: `${BASE_URL}/contact`, priority: 0.8 },
        { url: `${BASE_URL}/events`, priority: 0.8 },
        { url: `${BASE_URL}/faq`, priority: 0.8 },
        { url: `${BASE_URL}/careers`, priority: 0.8 },
        { url: `${BASE_URL}/products`, priority: 0.8 },
        { url: `${BASE_URL}/privacy`, priority: 0.8 },
        { url: `${BASE_URL}/terms`, priority: 0.8 },
        { url: `${BASE_URL}/returns`, priority: 0.8 },
        { url: `${BASE_URL}/shipping`, priority: 0.8 },
        { url: `${BASE_URL}/size-guide`, priority: 0.8 },
    ]

    // TODO: Fetch dynamic product and category pages from Sanity and include them here

    return staticPages.map(({ url, priority }) => ({
        url,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority,
    }))
}
