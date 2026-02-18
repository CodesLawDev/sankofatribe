import { client, urlFor } from '@/lib/sanity'
import type { HomePage, Product, Category, Event, Campaign } from '@/lib/sanity'
import PremiumHeroBanner from '@/components/premium-hero-banner'
import RewardsCallout from '@/components/rewards-callout'
import FeaturedCategories from '@/components/featured-categories'
import Spotlight from '@/components/spotlight'
import ProductGrid from '@/components/product-grid'
import PopupModalWrapper from '@/components/popup-modal-wrapper'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

async function getHomePageData() {
    const query = `*[_type == "homePage"][0] {
    _id,
    collectionHeading,
    collectionSubheading,
    "heroBanners": heroBanners[]-> {
      _id,
      title,
      subtitle,
      order,
      displayMode,
      image,
      videoUrl,
      ctaText,
      ctaLink,
      ctaLinkSelect,
      "ctaCategory": ctaCategory->{slug},
      "ctaProduct": ctaProduct->{slug},
      ctaTextSecondary,
      ctaLinkSecondary,
      ctaLinkSecondarySelect,
      "ctaCategorySecondary": ctaCategorySecondary->{slug},
      "ctaProductSecondary": ctaProductSecondary->{slug},
      textColor
    } | order(order asc),
    "featuredProducts": featuredProducts[]-> {
      _id,
      name,
      slug,
      images,
      price,
      inStock,
      featured,
      sizes[]{size, stock},
      hasDiscount,
      discountType,
      discountValue,
      discountStartDate,
      discountEndDate,
      weight,
      "categories": categories[]-> {
        _id,
        name,
        slug,
        image
      },
      soldCount
    },
    "latestCollectionProducts": latestCollectionProducts[]-> {
      _id,
      name,
      slug,
      images,
      price,
      inStock,
      featured,
      sizes[]{size, stock},
      hasDiscount,
      discountType,
      discountValue,
      discountStartDate,
      discountEndDate,
      weight,
      "categories": categories[]-> {
        _id,
        name,
        slug,
        image
      },
      soldCount
    },
    "featuredCategories": featuredCategories[]-> {
      _id,
      name,
      slug,
      image
    }
  }`

    const homePage = await client.fetch<HomePage>(query, {}, { next: { revalidate: 0 } })
    return homePage
}

async function getCategories() {
    const query = `*[_type == "category" && !defined(parentCategory)] | order(name asc)[0...6] {
      _id,
      name,
      slug,
      image,
      "subCategories": subCategories[]->{
        _id,
        name,
        slug,
        image
      }
    }`

    const categories = await client.fetch<Category[]>(query, {}, { next: { revalidate: 0 } })
    return categories
}

async function getPopupEvents() {
    const query = `*[_type == "event" && showAsPopup == true && status != "cancelled"] | order(_createdAt desc)[0] {
    _id,
    title,
    slug,
    image,
    summary,
    description,
    eventDate,
    endDate,
    location,
    category,
    status,
    registrationUrl
  }`

    try {
        const event = await client.fetch<Event | null>(query, {}, { next: { revalidate: 3600 } })
        return event
    } catch (error) {
        console.error('Error fetching popup event:', error)
        return null
    }
}

async function getPopupCampaigns() {
    const query = `*[_type == "campaign" && showAsPopup == true && isActive == true] | order(_createdAt desc)[0] {
    _id,
    name,
    slug,
    bannerImage,
    bannerTitle,
    bannerSubtitle,
    description,
    startDate,
    endDate,
    discountType,
    discountValue
  }`

    try {
        const campaign = await client.fetch<Campaign | null>(query, {}, { next: { revalidate: 3600 } })
        return campaign
    } catch (error) {
        console.error('Error fetching popup campaign:', error)
        return null
    }
}

async function getFeaturedProducts() {
    const query = `*[_type == "product" && featured == true][0...8] | order(_createdAt desc) {
    _id,
    name,
    slug,
    images,
    price,
    inStock,
    featured,
    sizes[]{size, stock},
    "categories": categories[]-> {
      _id,
      name,
      slug
    },
    soldCount
  }`

    const products = await client.fetch<Product[]>(query, {}, { next: { revalidate: 0 } })
    return products
}

export default async function HomePage() {
    const homePageData = await getHomePageData()

    const [categories, featuredProducts, popupEvent, popupCampaign] = await Promise.all([
        getCategories(),
        homePageData?.latestCollectionProducts ? Promise.resolve(homePageData.latestCollectionProducts) : 
        homePageData?.featuredProducts ? Promise.resolve(homePageData.featuredProducts) : 
        getFeaturedProducts(),
        getPopupEvents(),
        getPopupCampaigns(),
    ])

    const cmsFeaturedCategories = (homePageData?.featuredCategories || []).map((cat) => ({
        id: cat._id,
        title: cat.name,
        image: cat.image && (cat.image as any).asset ? urlFor(cat.image).width(800).height(800).url() : '',
        link: `/category/${cat.slug.current}`,
    }))

    const dynamicCategories = categories.map((cat) => ({
        id: cat._id,
        title: cat.name,
        image: cat.image && (cat.image as any).asset ? urlFor(cat.image).width(800).height(800).url() : '',
        link: `/category/${cat.slug.current}`,
    }))

    const defaultFeaturedCategories = [
        { id: 'men', title: "Men's Collection", image: '', link: '/category/men' },
        { id: 'women', title: "Women's Collection", image: '', link: '/category/women' },
        { id: 'sale', title: 'On Sale', image: '', link: '/products?filter=sale' },
    ]

    const featuredCategoryList = cmsFeaturedCategories.length
        ? cmsFeaturedCategories
        : dynamicCategories.length
        ? dynamicCategories
        : defaultFeaturedCategories

    return (
        <div className="bg-white text-black">
            {/* Hero Banners - Mixed full-width and cards */}
            {homePageData?.heroBanners && homePageData.heroBanners.length > 0 ? (
                <div className="space-y-8 md:space-y-12 lg:space-y-16">
                    {(() => {
                        const banners = homePageData.heroBanners
                        const result = []
                        let i = 0
                        
                        while (i < banners.length) {
                            const banner = banners[i]
                            
                            // Full-width banner
                            if (banner.displayMode === 'full' || !banner.displayMode) {
                                result.push(
                                    <PremiumHeroBanner
                                        key={banner._id || i}
                                        image={banner.image}
                                        videoUrl={banner.videoUrl}
                                        title={banner.title || "SANKOFA TRIBE"}
                                        subtitle={banner.subtitle || "Premium African Heritage Fashion"}
                                        ctaText={banner.ctaText || "Explore Collection"}
                                        ctaLink={banner.ctaLink || "/products"}
                                        ctaLinkSelect={banner.ctaLinkSelect}
                                        ctaCategory={banner.ctaCategory}
                                        ctaProduct={banner.ctaProduct}
                                        ctaTextSecondary={banner.ctaTextSecondary}
                                        ctaLinkSecondary={banner.ctaLinkSecondary}
                                        ctaLinkSecondarySelect={banner.ctaLinkSecondarySelect}
                                        ctaCategorySecondary={banner.ctaCategorySecondary}
                                        ctaProductSecondary={banner.ctaProductSecondary}
                                        textPosition="center"
                                        textColor={banner.textColor || "white"}
                                    />
                                )
                                i++
                            } 
                            // Card mode - group up to 3 cards
                            else if (banner.displayMode === 'card') {
                                const cardBanners = []
                                let j = i
                                
                                // Collect up to 3 consecutive card banners
                                while (j < banners.length && banners[j].displayMode === 'card' && cardBanners.length < 3) {
                                    cardBanners.push(banners[j])
                                    j++
                                }
                                
                                result.push(
                                    <div key={`cards-${i}`} className="w-full">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                                            {cardBanners.map((cardBanner, idx) => (
                                                <div key={cardBanner._id || idx} className="relative h-[50vh] md:h-[60vh] overflow-hidden group">
                                                    {cardBanner.image && (
                                                        <Image
                                                            src={urlFor(cardBanner.image).width(800).height(600).url()}
                                                            alt={cardBanner.title || 'Banner'}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/20" />
                                                    <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-6 pb-8">
                                                        <div className={`${cardBanner.textColor === 'black' ? 'text-black' : 'text-white'}`}>
                                                            {cardBanner.title && (
                                                                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3">
                                                                    {cardBanner.title}
                                                                </h3>
                                                            )}
                                                            {cardBanner.subtitle && (
                                                                <p className="text-sm md:text-base mb-6 opacity-90">
                                                                    {cardBanner.subtitle}
                                                                </p>
                                                            )}
                                                            {cardBanner.ctaText && cardBanner.ctaLink && (
                                                                <Link href={cardBanner.ctaLink}>
                                                                    <Button
                                                                        size="sm"
                                                                        className="bg-white/90 text-black hover:bg-white"
                                                                    >
                                                                        {cardBanner.ctaText}
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                                i = j
                            }
                        }
                        
                        return result
                    })()}
                </div>
            ) : (
                <PremiumHeroBanner
                    image={null}
                    title="SANKOFA TRIBE"
                    subtitle="Premium African Heritage Fashion"
                    ctaText="Explore Collection"
                    ctaLink="/products"
                    textPosition="center"
                    textColor="white"
                />
            )}


            {/* Final Callout Section (last part of page) */}
            <RewardsCallout />

            {/* Removed extra grid/benefits sections per request */}

            {/* Popup Modals for Events & Campaigns */}
            <PopupModalWrapper 
                popupEvent={popupEvent}
                popupCampaign={popupCampaign}
            />
        </div>
    )
}
