import { client, urlFor } from '@/lib/sanity'
import type { HomePage, Product, Category } from '@/lib/sanity'
import PremiumHeroBanner from '@/components/premium-hero-banner'
import BannerGrid from '@/components/banner-grid'
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

            {/* Collection Section (last part will be added as provided) */}
            <section className="py-20 md:py-32 bg-gray-50">
                <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">{homePageData?.collectionHeading || 'Latest Collections'}</h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            {homePageData?.collectionSubheading || 'Discover our carefully curated selection of premium products'}
                        </p>
                    </div>
                    {(homePageData?.latestCollectionProducts?.length || featuredProducts?.length) && (homePageData?.latestCollectionProducts?.length || 0) + (featuredProducts?.length || 0) > 8 && (
                        <ProductGrid products={(homePageData?.latestCollectionProducts || featuredProducts)?.slice(0, 8) || []} />
                    )}
                </div>
            </section>

            {/* Categories Grid Section */}
            <section className="grid grid-cols-2 md:grid-cols-4 border-t border-gray-200">
                <Link href="/category/men" className="group relative aspect-square overflow-hidden bg-gray-100 border-b border-r border-gray-200">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-2xl font-bold text-white text-center">Men</h3>
                    </div>
                </Link>
                <Link href="/category/women" className="group relative aspect-square overflow-hidden bg-gray-100 border-b border-r border-gray-200">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-2xl font-bold text-white text-center">Women</h3>
                    </div>
                </Link>
                <Link href="/products?filter=sale" className="group relative aspect-square overflow-hidden bg-gray-100 border-b border-r border-gray-200">
                    <div className="absolute inset-0 bg-red-600/20 group-hover:bg-red-600/40 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-2xl font-bold text-white text-center">Sale</h3>
                    </div>
                </Link>
                <Link href="/products?filter=new" className="group relative aspect-square overflow-hidden bg-gray-100 border-b border-gray-200">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-2xl font-bold text-white text-center">New</h3>
                    </div>
                </Link>
            </section>

            {/* Benefits Section */}
            <section className="bg-black text-white py-16 md:py-24">
                <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="text-4xl font-bold mb-4">Free Shipping</div>
                            <p className="text-gray-400">On orders over $100</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold mb-4">30-Day Returns</div>
                            <p className="text-gray-400">Easy returns & exchanges</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold mb-4">Premium Support</div>
                            <p className="text-gray-400">24/7 customer service</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
