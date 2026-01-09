'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import PremiumHeroBanner from './premium-hero-banner'

interface Banner {
    _id: string
    title?: string
    subtitle?: string
    image: any
    videoUrl?: string
    ctaText?: string
    ctaLink?: string
    ctaLinkSelect?: string
    ctaCategory?: { slug?: { current: string } }
    ctaProduct?: { slug?: { current: string } }
    ctaTextSecondary?: string
    ctaLinkSecondary?: string
    ctaLinkSecondarySelect?: string
    ctaCategorySecondary?: { slug?: { current: string } }
    ctaProductSecondary?: { slug?: { current: string } }
    textColor?: 'white' | 'black'
}

interface HeroCarouselProps {
    banners: Banner[]
    autoPlayInterval?: number
}

export default function HeroCarousel({ banners, autoPlayInterval = 5000 }: HeroCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        if (banners.length <= 1) return

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length)
        }, autoPlayInterval)

        return () => clearInterval(interval)
    }, [banners.length, autoPlayInterval])

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
    }

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % banners.length)
    }

    const goToSlide = (index: number) => {
        setCurrentIndex(index)
    }

    if (!banners || banners.length === 0) {
        return (
            <PremiumHeroBanner
                image={null}
                title="SANKOFA TRIBE"
                subtitle="Premium African Heritage Fashion"
                ctaText="Explore Collection"
                ctaLink="/products"
                textPosition="center"
                textColor="white"
            />
        )
    }

    const currentBanner = banners[currentIndex]

    return (
        <div className="relative">
            <PremiumHeroBanner
                image={currentBanner.image}
                videoUrl={currentBanner.videoUrl}
                title={currentBanner.title || "SANKOFA TRIBE"}
                subtitle={currentBanner.subtitle || "Premium African Heritage Fashion"}
                ctaText={currentBanner.ctaText || "Explore Collection"}
                ctaLink={currentBanner.ctaLink || "/products"}
                ctaLinkSelect={currentBanner.ctaLinkSelect}
                ctaCategory={currentBanner.ctaCategory}
                ctaProduct={currentBanner.ctaProduct}
                ctaTextSecondary={currentBanner.ctaTextSecondary}
                ctaLinkSecondary={currentBanner.ctaLinkSecondary}
                ctaLinkSecondarySelect={currentBanner.ctaLinkSecondarySelect}
                ctaCategorySecondary={currentBanner.ctaCategorySecondary}
                ctaProductSecondary={currentBanner.ctaProductSecondary}
                textPosition="center"
                textColor={currentBanner.textColor || "white"}
            />

            {/* Navigation arrows - only show if multiple banners */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 rounded-full transition-all z-10"
                        aria-label="Previous banner"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-2 rounded-full transition-all z-10"
                        aria-label="Next banner"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dot indicators */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    index === currentIndex
                                        ? 'bg-white w-8'
                                        : 'bg-white/50 hover:bg-white/75'
                                }`}
                                aria-label={`Go to banner ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
