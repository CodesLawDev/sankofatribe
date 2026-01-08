import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from '@sanity/image-url/lib/types/types'

export const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
    useCdn: true,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
    return builder.image(source)
}

// Types for Sanity data
export interface SanityImage {
    _type: 'image'
    asset: {
        _ref: string
        _type: 'reference'
    }
}

export interface Product {
    _id: string
    _type: 'product'
    name: string
    slug: { current: string }
    images: SanityImage[]
    description?: string
    price: number
    categories?: Category[]
    sizes?: { size: string; stock: number }[]
    colors?: { name: string; hex: string }[]
    featured?: boolean
    inStock?: boolean
    soldCount?: number
}

export interface Category {
    _id: string
    _type: 'category'
    name: string
    slug: { current: string }
    description?: string
    image?: SanityImage
}

export interface Banner {
    _id: string
    _type: 'banner'
    title?: string
    subtitle?: string
    image: SanityImage
    ctaText?: string
    ctaLink?: string
    textColor: 'white' | 'black'
}

export interface HomePage {
    _id: string
    heroBanners?: Banner[]
    featuredProducts?: Product[]
    featuredCategories?: Category[]
}

export interface SiteSettings {
    _id: string
    siteName: string
    logo?: SanityImage
    description?: string
    mainNavigation?: { title: string; link: string }[]
    footerText?: string
    socialLinks?: {
        instagram?: string
        facebook?: string
        twitter?: string
    }
}
