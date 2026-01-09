import Image from 'next/image'
import Link from 'next/link'
import { Banner } from '@/lib/sanity'
import { urlFor } from '@/lib/sanity'
import { Button } from './ui/button'
import { getVideoSource } from '@/lib/video-utils'

interface BannerGridProps {
  title?: string
  layout: 'two' | 'three'
  banners: Banner[]
}

export default function BannerGrid({ title, layout, banners }: BannerGridProps) {
  const cols = layout === 'three' ? 'md:grid-cols-3' : 'md:grid-cols-2'
  const items = (banners || []).slice(0, layout === 'three' ? 3 : 2)

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
        {title && (
          <div className="mb-6">
            <h3 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h3>
          </div>
        )}
        <div className={`grid grid-cols-1 ${cols} gap-4 md:gap-6`}>
          {items.map((banner) => {
            const hasImage = banner.image && (banner.image as any).asset
            const imageUrl = hasImage ? urlFor(banner.image).width(1600).height(900).url() : null
            const videoSource = getVideoSource(banner.videoUrl || '')
            
            return (
              <div key={banner._id} className="relative aspect-[16/9] overflow-hidden rounded-lg bg-gray-100">
                {/* Video Background - YouTube or Vimeo */}
                {videoSource.type === 'youtube' || videoSource.type === 'vimeo' ? (
                  <iframe
                    src={(videoSource as any).embedUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={banner.title}
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
                      <Image src={imageUrl} alt={banner.title || 'Banner'} fill className="object-cover" />
                    )}
                  </video>
                ) : imageUrl ? (
                  <Image src={imageUrl} alt={banner.title || 'Banner'} fill className="object-cover" />
                ) : null}
                
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 flex items-end">
                  <div className="p-4 sm:p-6 w-full">
                    {banner.title && (
                      <h4 className="text-white text-lg sm:text-xl font-semibold mb-1">{banner.title}</h4>
                    )}
                    {banner.subtitle && (
                      <p className="text-white/90 text-xs sm:text-sm mb-3">{banner.subtitle}</p>
                    )}
                    {(banner.ctaText && banner.ctaLink) || (banner.ctaTextSecondary && banner.ctaLinkSecondary) ? (
                      <div className="flex flex-wrap gap-2">
                        {banner.ctaText && banner.ctaLink && (
                          <Link href={banner.ctaLink}>
                            <Button size="sm" className="bg-white text-black hover:bg-white/90">{banner.ctaText}</Button>
                          </Link>
                        )}
                        {banner.ctaTextSecondary && banner.ctaLinkSecondary && (
                          <Link href={banner.ctaLinkSecondary!}>
                            <Button size="sm" variant="secondary" className="bg-transparent border border-white text-white hover:bg-white hover:text-black">
                              {banner.ctaTextSecondary}
                            </Button>
                          </Link>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
