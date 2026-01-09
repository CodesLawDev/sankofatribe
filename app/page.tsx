import { client, urlFor } from '@/lib/sanity'
import type { HomePage, Product, Category } from '@/lib/sanity'
import PremiumHeroBanner from '@/components/premium-hero-banner'
import BannerGrid from '@/components/banner-grid'
import RewardsCallout from '@/components/rewards-callout'
import FeaturedCategories from '@/components/featured-categories'
import Spotlight from '@/components/spotlight'
import ProductGrid from '@/components/product-grid'
import Link from 'next/link'
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
      image,
      videoUrl,
      ctaText,
      ctaLink,
      ctaTextSecondary,
      ctaLinkSecondary,
      textColor
    },
    "featuredProducts": featuredProducts[]-> {
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
        ,
        bannerSections[]{
            title,
            layout,
            "banners": banners[]->{
                _id,
                title,
                subtitle,
                image,
                videoUrl,
                ctaText,
                ctaLink,
                ctaTextSecondary,
                ctaLinkSecondary,
                textColor
            }
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

    const [categories, featuredProducts] = await Promise.all([
        getCategories(),
        homePageData?.latestCollectionProducts ? Promise.resolve(homePageData.latestCollectionProducts) : 
        homePageData?.featuredProducts ? Promise.resolve(homePageData.featuredProducts) : 
        getFeaturedProducts()
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
            {/* Main Hero Section - Premium Nike Style */}
            {homePageData?.heroBanners?.[0] ? (
                <PremiumHeroBanner
                    image={homePageData.heroBanners[0].image}
                    videoUrl={homePageData.heroBanners[0].videoUrl}
                    title={homePageData.heroBanners[0].title || "SANKOFA TRIBE"}
                    subtitle={homePageData.heroBanners[0].subtitle || "Premium African Heritage Fashion"}
                    ctaText={homePageData.heroBanners[0].ctaText || "Explore Collection"}
                    ctaLink={homePageData.heroBanners[0].ctaLink || "/products"}
                    textPosition="center"
                    textColor="white"
                />
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

            {/* Render all curated banner sections (2-up / 3-up) */}
            {homePageData?.bannerSections?.length ? (
                homePageData.bannerSections.map((section, idx) => (
                    <BannerGrid key={idx} title={section.title} layout={(section.layout as any) || 'two'} banners={section.banners || []} />
                ))
            ) : null}

            {/* Final Callout Section (last part of page) */}
            <RewardsCallout />

            {/* Removed extra grid/benefits sections per request */}
        </div>
    )
}
