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
    audience?: 'men' | 'women' | 'kids' | 'unisex'
    categories?: Category[]
    sizes?: { size: string; stock: number }[]
    colors?: { name: string; hex: string }[]
    featured?: boolean
    inStock?: boolean
    soldCount?: number
    hasDiscount?: boolean
    discountType?: 'percentage' | 'fixed'
    discountValue?: number
    discountStartDate?: string
    discountEndDate?: string
    weight?: number
}

export interface Category {
    _id: string
    _type: 'category'
    name: string
    slug: { current: string }
    description?: string
    image?: SanityImage
    parentCategory?: Category
    subCategories?: Category[]
}

export interface Banner {
    _id: string
    _type: 'banner'
    title?: string
    subtitle?: string
    order?: number
    displayMode?: 'full' | 'card'
    image: SanityImage
    videoUrl?: string
    ctaText?: string
    ctaLink?: string
    ctaLinkSelect?: string
    ctaCategory?: Category
    ctaProduct?: Product
    ctaTextSecondary?: string
    ctaLinkSecondary?: string
    ctaLinkSecondarySelect?: string
    ctaCategorySecondary?: Category
    ctaProductSecondary?: Product
    textColor: 'white' | 'black'
}

export interface HomePage {
    _id: string
    heroBanners?: Banner[]
    featuredProducts?: Product[]
    featuredCategories?: Category[]
    collectionHeading?: string
    collectionSubheading?: string
    latestCollectionProducts?: Product[]
    bannerDisplayMode?: 'all' | 'curated'
    bannerSections?: Array<{
        title?: string
        layout: 'two' | 'three'
        banners: Banner[]
    }>
}

export interface PromoCode {
    _id: string
    _type: 'promoCode'
    code: string
    description?: string
    discountType: 'percentage' | 'fixed' | 'free_shipping'
    discountValue?: number
    minimumPurchase?: number
    maxDiscount?: number
    usageLimit?: number
    usageLimitPerCustomer?: number
    timesUsed?: number
    validFrom: string
    validUntil: string
    isActive?: boolean
    applicableProducts?: Product[]
    applicableCategories?: Category[]
    firstTimeCustomerOnly?: boolean
    subscribersOnly?: boolean
    singleItemOnly?: boolean
}

export interface Campaign {
    _id: string
    _type: 'campaign'
    name: string
    slug: { current: string }
    description?: string
    startDate: string
    endDate: string
    isActive?: boolean
    bannerImage?: SanityImage
    bannerTitle?: string
    bannerSubtitle?: string
    showOnHomepage?: boolean
    showAsPopup?: boolean
    discountType: 'percentage' | 'fixed' | 'custom'
    discountValue?: number
    includedProducts?: Product[]
    includedCategories?: Category[]
    excludedProducts?: Product[]
    stackWithPromos?: boolean
}

export interface Customer {
    _id: string
    _type: 'customer'
    email: string
    firstName: string
    lastName: string
    phone?: string
    profileImage?: SanityImage
    registeredAt: string
    lastLogin?: string
    status: 'active' | 'inactive' | 'suspended' | 'deleted'
    shippingAddresses?: Array<{
        id: string
        label?: string
        street: string
        city: string
        region?: string
        postalCode?: string
        country: string
        isDefault?: boolean
    }>
    orders?: string[]
    totalOrders?: number
    totalSpent?: number
    loyaltyPoints?: number
    preferences?: {
        emailMarketing?: boolean
        smsNotifications?: boolean
        orderUpdates?: boolean
    }
    notes?: string
}

export interface SiteSettings {
    _id: string
    siteName: string
    logo?: SanityImage
    description?: string
    mainNavigation?: { title: string; link: string }[]
}

export interface Career {
    _id: string
    _type: 'career'
    title: string
    slug?: { current: string }
    department?: string
    employmentType?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary'
    location?: string
    isRemote?: boolean
    salaryRange?: string
    summary?: string
    description?: any
    responsibilities?: string[]
    requirements?: string[]
    perks?: string[]
    applicationUrl?: string
    applicationEmail?: string
    status?: 'open' | 'closed' | 'draft'
    postedAt?: string
    closingDate?: string
    featured?: boolean
}

export interface Event {
    _id: string
    _type: 'event'
    title: string
    slug: { current: string }
    image: SanityImage
    summary: string
    description?: any
    eventDate: string
    endDate?: string
    location?: {
        venue?: string
        address?: string
        city?: string
        isVirtual?: boolean
        virtualLink?: string
    }
    category?: 'fashion-show' | 'popup' | 'workshop' | 'launch' | 'sale' | 'community' | 'other'
    ticketInfo?: {
        isFree?: boolean
        price?: number
        currency?: string
        ticketUrl?: string
        ticketTiers?: Array<{
            _key: string
            name: string
            description?: string
            price: number
            quantity: number
            sold?: number
        }>
        maxCapacity?: number
    }
    registrationUrl?: string
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
    featured?: boolean
    showAsPopup?: boolean
    gallery?: SanityImage[]
    publishedAt?: string
}
