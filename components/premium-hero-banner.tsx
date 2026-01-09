import Image from 'next/image'
import Link from 'next/link'
import { Button } from './ui/button'
import { urlFor } from '@/lib/sanity'
import { getVideoSource } from '@/lib/video-utils'

interface HeroBannerProps {
    image: any // Sanity image object or URL string
    videoUrl?: string // Optional video URL
    title: string
    subtitle?: string
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
    textPosition?: 'left' | 'center' | 'right'
    textColor?: 'white' | 'black'
}

export default function PremiumHeroBanner({
    image,
    videoUrl,
    title,
    subtitle,
    ctaText,
    ctaLink,
    ctaLinkSelect,
    ctaCategory,
    ctaProduct,
    ctaTextSecondary,
    ctaLinkSecondary,
    ctaLinkSecondarySelect,
    ctaCategorySecondary,
    ctaProductSecondary,
    textPosition = 'left',
    textColor = 'white',
}: HeroBannerProps) {
    const positionClasses = {
        left: 'items-start',
        center: 'items-center text-center',
        right: 'items-end',
    }

    const textColorClasses = {
        white: 'text-white',
        black: 'text-black',
    }

    // Handle both Sanity image objects and URL strings
    const imageUrl = typeof image === 'string' 
        ? image 
        : image && (image as any).asset
            ? urlFor(image).width(1920).height(1080).url()
            : null

    const resolveLink = (select?: string, manual?: string, category?: { slug?: { current: string } }, product?: { slug?: { current: string } }) => {
        if (select) {
            switch (select) {
                case 'home': return '/'
                case 'products': return '/products'
                case 'products-men': return '/products?audience=men'
                case 'products-women': return '/products?audience=women'
                case 'products-kids': return '/products?audience=kids'
                case 'wishlist': return '/wishlist'
                case 'cart': return '/cart'
                case 'account': return '/account'
                case 'contact': return '/contact'
                case 'faq': return '/faq'
                default: break
            }
        }
        if (category?.slug?.current) return `/category/${category.slug.current}`
        if (product?.slug?.current) return `/products/${product.slug.current}`
        return manual
    }

    const primaryHref = resolveLink(ctaLinkSelect, ctaLink, ctaCategory, ctaProduct)
    const secondaryHref = resolveLink(ctaLinkSecondarySelect, ctaLinkSecondary, ctaCategorySecondary, ctaProductSecondary)

    // Determine video source type
    const videoSource = getVideoSource(videoUrl || '')

    return (
        <div className="relative w-full h-[60vh] md:h-[75vh] lg:h-[85vh] overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
            {/* Background Video or Image */}
            {videoSource.type === 'youtube' || videoSource.type === 'vimeo' ? (
                <iframe
                    src={(videoSource as any).embedUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={title}
                />
            ) : videoSource.type === 'direct' ? (
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls={false}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => console.error('Video playback error:', e)}
                >
                    <source src={(videoSource as any).url} type="video/mp4" />
                    <source src={(videoSource as any).url} type="video/webm" />
                    <source src={(videoSource as any).url} type="video/ogg" />
                    {/* Fallback to image if video fails */}
                    {imageUrl && (
                        <Image
                            src={imageUrl}
                            alt={title}
                            fill
                            className="object-cover object-center"
                            priority
                            quality={95}
                        />
                    )}
                </video>
            ) : imageUrl ? (
                <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover object-center"
                    priority
                    quality={95}
                />
            ) : null}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20" />

            {/* Content */}
            <div className={`absolute inset-0 flex flex-col ${positionClasses[textPosition]} justify-center px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full`}>
                <div className={`max-w-2xl ${textColorClasses[textColor]}`}>
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-4 leading-tight">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-base md:text-lg lg:text-xl mb-8 font-light opacity-90">
                            {subtitle}
                        </p>
                    )}
                    {(ctaText && primaryHref) || (ctaTextSecondary && secondaryHref) ? (
                        <div className={`flex flex-wrap gap-3 ${textPosition === 'center' ? 'justify-center' : ''}`}>
                            {ctaText && primaryHref && (
                                <Link href={primaryHref}>
                                    <Button
                                        size="lg"
                                        className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300"
                                    >
                                        {ctaText}
                                    </Button>
                                </Link>
                            )}
                            {ctaTextSecondary && secondaryHref && (
                                <Link href={secondaryHref}>
                                    <Button
                                        size="lg"
                                        variant={textColor === 'white' ? 'secondary' : 'default'}
                                        className="bg-white/90 text-black hover:bg-white border-0"
                                    >
                                        {ctaTextSecondary}
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
