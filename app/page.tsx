import { client } from '@/lib/sanity'
import type { HomePage, Product } from '@/lib/sanity'
import HeroBanner from '@/components/hero-banner'
import ProductGrid from '@/components/product-grid'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function getHomePageData() {
    const query = `*[_type == "homePage"][0] {
    _id,
    "heroBanners": heroBanners[]-> {
      _id,
      title,
      subtitle,
      image,
      ctaText,
      ctaLink,
      textColor
    },
    "featuredProducts": featuredProducts[]-> {
      _id,
      name,
      slug,
      images,
      price,
      inStock,
      featured
    }
  }`

    const homePage = await client.fetch<HomePage>(query, {}, { next: { revalidate: 60 } })
    return homePage
}

async function getFeaturedProducts() {
    const query = `*[_type == "product" && featured == true][0...8] | order(_createdAt desc) {
    _id,
    name,
    slug,
    images,
    price,
    inStock,
    featured
  }`

    const products = await client.fetch<Product[]>(query, {}, { next: { revalidate: 60 } })
    return products
}

export default async function HomePage() {
    const homePageData = await getHomePageData()
    const featuredProducts = homePageData?.featuredProducts || await getFeaturedProducts()

    return (
        <div className="bg-white">
            {/* Hero Banner 1 - Main promotional banner */}
            {homePageData?.heroBanners && homePageData.heroBanners.length > 0 && (
                <section>
                    {homePageData.heroBanners[0] && (
                        <HeroBanner banner={homePageData.heroBanners[0]} />
                    )}
                </section>
            )}

            {/* Hero Banner 2 - Secondary campaign (if available) */}
            {homePageData?.heroBanners && homePageData.heroBanners.length > 1 && (
                <section>
                    <HeroBanner banner={homePageData.heroBanners[1]} />
                </section>
            )}

            {/* 4-Grid Category Section - "FOR HER", "FOR HIM", "TOP GIFTS", "UNDER $50" */}
            <section className="grid grid-cols-2 lg:grid-cols-4">
                <Link href="/category/women" className="group relative h-[50vh] lg:h-[60vh] overflow-hidden bg-gray-50">
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/30 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-[0.2em] uppercase text-white group-hover:scale-105 transition-transform duration-500">
                            FOR HER
                        </h3>
                    </div>
                </Link>
                <Link href="/category/men" className="group relative h-[50vh] lg:h-[60vh] overflow-hidden bg-neutral-100">
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/30 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-[0.2em] uppercase text-white group-hover:scale-105 transition-transform duration-500">
                            FOR HIM
                        </h3>
                    </div>
                </Link>
                <Link href="/products?filter=gifts" className="group relative h-[50vh] lg:h-[60vh] overflow-hidden bg-neutral-200">
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/30 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-[0.2em] uppercase text-white group-hover:scale-105 transition-transform duration-500">
                            TOP GIFTS
                        </h3>
                    </div>
                </Link>
                <Link href="/products?price=under-50" className="group relative h-[50vh] lg:h-[60vh] overflow-hidden bg-neutral-300">
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/30 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-[0.2em] uppercase text-white group-hover:scale-105 transition-transform duration-500">
                            UNDER $50
                        </h3>
                    </div>
                </Link>
            </section>

            {/* Hero Banner 3 - Third campaign (if available) */}
            {homePageData?.heroBanners && homePageData.heroBanners.length > 2 && (
                <section>
                    <HeroBanner banner={homePageData.heroBanners[2]} />
                </section>
            )}

            {/* Hero Banner 4 - Fourth campaign (if available) */}
            {homePageData?.heroBanners && homePageData.heroBanners.length > 3 && (
                <section>
                    <HeroBanner banner={homePageData.heroBanners[3]} />
                </section>
            )}

            {/* Text-Only Section - "HOLIDAY HEAT" style */}
            <section className="bg-brand-cream py-20 md:py-32">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
                    <h2 className="text-6xl md:text-8xl lg:text-9xl font-light tracking-wider uppercase text-center mb-12">
                        HOLIDAY HEAT
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        <Link href="/products?category=gifts" className="group py-8 border-t-2 border-brand-primary hover:opacity-60 transition-opacity">
                            <div className="flex items-center justify-between">
                                <span className="text-xl md:text-2xl font-light uppercase tracking-wider text-brand-dark">SHOP ALL GIFTS</span>
                                <span className="text-2xl">→</span>
                            </div>
                        </Link>
                        <Link href="/products?category=top-gifts" className="group py-8 border-t-2 border-brand-primary hover:opacity-60 transition-opacity">
                            <div className="flex items-center justify-between">
                                <span className="text-xl md:text-2xl font-light uppercase tracking-wider text-brand-dark">TOP GIFTS</span>
                                <span className="text-2xl">→</span>
                            </div>
                        </Link>
                        <Link href="/products?category=women-gifts" className="group py-8 border-t-2 border-brand-primary hover:opacity-60 transition-opacity">
                            <div className="flex items-center justify-between">
                                <span className="text-xl md:text-2xl font-light uppercase tracking-wider text-brand-dark">WOMEN&apos;S GIFTS</span>
                                <span className="text-2xl">→</span>
                            </div>
                        </Link>
                        <Link href="/products?category=men-gifts" className="group py-8 border-t-2 border-brand-primary hover:opacity-60 transition-opacity">
                            <div className="flex items-center justify-between">
                                <span className="text-xl md:text-2xl font-light uppercase tracking-wider text-brand-dark">MEN&apos;S GIFTS</span>
                                <span className="text-2xl">→</span>
                            </div>
                        </Link>
                        <Link href="/products?price=under-50" className="group py-8 border-t-2 border-brand-primary hover:opacity-60 transition-opacity">
                            <div className="flex items-center justify-between">
                                <span className="text-xl md:text-2xl font-light uppercase tracking-wider text-brand-dark">GIFTS UNDER $50</span>
                                <span className="text-2xl">→</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Rewards Banner */}
            <section className="relative h-[50vh] bg-gradient-to-br from-gray-800 to-gray-900 text-white flex items-center justify-center">
                <div className="text-center px-4 max-w-3xl">
                    <p className="text-xs uppercase tracking-[0.3em] mb-4 text-gray-400">INTRODUCING</p>
                    <h2 className="text-3xl md:text-5xl font-light tracking-wider mb-4">
                        My Sankofa Rewards
                    </h2>
                    <p className="text-4xl md:text-6xl font-light tracking-wide mb-8">
                        Earn. Redeem. Enjoy.
                    </p>
                    <p className="text-sm md:text-base mb-8 text-gray-300">
                        A new way to experience SANKOFA. Unlock exclusive benefits designed for you, every time you shop.
                    </p>
                    <Button size="lg" variant="secondary" className="min-w-[200px] border-white text-black">
                        Learn More
                    </Button>
                </div>
            </section>

            {/* Featured Products Grid */}
            {featuredProducts && featuredProducts.length > 0 && (
                <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-20 md:py-32">
                    <div className="text-center mb-16">
                        <h2 className="text-xs uppercase tracking-[0.3em] font-medium mb-3 text-gray-600">
                            New Arrivals
                        </h2>
                        <p className="text-3xl md:text-4xl font-light tracking-wider">
                            The Latest Collection
                        </p>
                    </div>
                    <ProductGrid products={featuredProducts} />
                    <div className="text-center mt-16">
                        <Link href="/products">
                            <Button size="lg" variant="secondary" className="min-w-[200px]">
                                Shop All
                            </Button>
                        </Link>
                    </div>
                </section>
            )}

            {/* Bottom Category Grid */}
            <section className="grid grid-cols-2 md:grid-cols-4 border-t border-neutral-100">
                <div className="border-r border-b border-neutral-100 p-8 md:p-12 text-center hover:bg-neutral-50 transition-colors">
                    <h3 className="text-lg md:text-xl font-light uppercase tracking-wider mb-4">Top Gifts</h3>
                    <p className="text-xs text-neutral-600 mb-6">Shop Now</p>
                    <div className="flex justify-center gap-4">
                        <Link href="/category/women?filter=gifts" className="text-xs hover:underline">Women</Link>
                        <Link href="/category/men?filter=gifts" className="text-xs hover:underline">Men</Link>
                    </div>
                </div>
                <div className="border-r border-b border-neutral-100 p-8 md:p-12 text-center hover:bg-neutral-50 transition-colors">
                    <h3 className="text-lg md:text-xl font-light uppercase tracking-wider mb-4">Underwear</h3>
                    <p className="text-xs text-neutral-600 mb-6">Shop Now</p>
                    <div className="flex justify-center gap-4">
                        <Link href="/category/women?filter=underwear" className="text-xs hover:underline">Women</Link>
                        <Link href="/category/men?filter=underwear" className="text-xs hover:underline">Men</Link>
                    </div>
                </div>
                <div className="border-r border-b border-neutral-100 p-8 md:p-12 text-center hover:bg-neutral-50 transition-colors">
                    <h3 className="text-lg md:text-xl font-light uppercase tracking-wider mb-4">Logo Gifts</h3>
                    <p className="text-xs text-neutral-600 mb-6">Shop Now</p>
                    <div className="flex justify-center gap-4">
                        <Link href="/category/women?filter=logo" className="text-xs hover:underline">Women</Link>
                        <Link href="/category/men?filter=logo" className="text-xs hover:underline">Men</Link>
                    </div>
                </div>
                <div className="border-b border-neutral-100 p-8 md:p-12 text-center hover:bg-neutral-50 transition-colors">
                    <h3 className="text-lg md:text-xl font-light uppercase tracking-wider mb-4">Fleece Gifts</h3>
                    <p className="text-xs text-neutral-600 mb-6">Shop Now</p>
                    <div className="flex justify-center gap-4">
                        <Link href="/category/women?filter=fleece" className="text-xs hover:underline">Women</Link>
                        <Link href="/category/men?filter=fleece" className="text-xs hover:underline">Men</Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
