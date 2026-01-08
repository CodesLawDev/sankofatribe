'use client'

import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity'
import { Banner as BannerType } from '@/lib/sanity'
import { Button } from './ui/button'

interface HeroBannerProps {
    banner: BannerType
}

export default function HeroBanner({ banner }: HeroBannerProps) {
    // Skip rendering if banner has no image
    if (!banner.image) {
        return null
    }

    const imageUrl = urlFor(banner.image).width(2400).height(1350).url()

    return (
       <div className="relative h-[50vh] md:h-[70vh] lg:h-[90vh] w-full overflow-hidden">
            <Image
                src={imageUrl}
                alt={banner.title || 'Hero banner'}
                fill
                className="object-cover"
                priority
                quality={95}
            />
            <div className="absolute inset-0 bg-black/10" />

            <div className="absolute inset-0 flex items-center justify-center">
                <div className={`text-center px-4 max-w-4xl ${banner.textColor === 'white' ? 'text-white' : 'text-black'}`}>
                    {banner.title && (
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-[0.15em] uppercase mb-6">
                            {banner.title}
                        </h2>
                    )}
                    {banner.subtitle && (
                        <p className="text-sm md:text-base tracking-wider mb-10 font-light opacity-90">
                            {banner.subtitle}
                        </p>
                    )}
                    {banner.ctaText && banner.ctaLink && (
                        <Link href={banner.ctaLink}>
                            <Button
                                size="lg"
                                variant={banner.textColor === 'white' ? 'default' : 'secondary'}
                                className="min-w-[200px]"
                            >
                                {banner.ctaText}
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
