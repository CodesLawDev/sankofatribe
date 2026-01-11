import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity'
import { Button } from './ui/button'

interface CampaignBannerProps {
    campaign: {
        _id: string
        name: string
        slug: { current: string }
        bannerImage?: any
        bannerTitle?: string
        bannerSubtitle?: string
        includedProducts?: Array<{ _id: string; slug: { current: string } }>
        includedCategories?: Array<{ _id: string; slug: { current: string } }>
    }
}

export default function CampaignBanner({ campaign }: CampaignBannerProps) {
    if (!campaign) return null

    const hasBannerImage = campaign.bannerImage && (campaign.bannerImage as any).asset
    const imageUrl = hasBannerImage ? urlFor(campaign.bannerImage).width(1600).height(400).url() : null

    // Build filter URL based on included products/categories
    let filterUrl = `/products?campaign=${campaign.slug.current}`
    
    if (campaign.includedCategories && campaign.includedCategories.length > 0) {
        const categoryIds = campaign.includedCategories.map((cat) => cat.slug.current).join(',')
        filterUrl = `/products?campaign=${campaign.slug.current}&categories=${categoryIds}`
    } else if (campaign.includedProducts && campaign.includedProducts.length > 0) {
        const productIds = campaign.includedProducts.map((prod) => prod.slug.current).join(',')
        filterUrl = `/products?campaign=${campaign.slug.current}&products=${productIds}`
    }

    return (
        <div className="relative w-screen left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] h-[30vh] md:h-[40vh] lg:h-[50vh] overflow-hidden group mb-4 md:mb-6">
            {imageUrl ? (
                <Image
                    src={imageUrl}
                    alt={campaign.bannerTitle || campaign.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-black to-gray-800" />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6">
                <div className="max-w-2xl">
                    {campaign.bannerTitle && (
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-4 tracking-tight">
                            {campaign.bannerTitle}
                        </h2>
                    )}
                    {campaign.bannerSubtitle && (
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-6 md:mb-8">
                            {campaign.bannerSubtitle}
                        </p>
                    )}
                    <Link href={filterUrl}>
                        <Button
                            size="lg"
                            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300 font-semibold px-8 md:px-10"
                        >
                            Shop Campaign
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
