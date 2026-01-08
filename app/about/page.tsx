/* eslint-disable @next/next/no-img-element */
import { getContentPage, ContentPageData } from '@/lib/content'
import { PortableText } from '@portabletext/react'
import { notFound } from 'next/navigation'

export async function generateMetadata() {
    const page = await getContentPage('about')
    return {
        title: page?.title ? `${page.title} - SANKOFA` : 'About Us - SANKOFA',
        description: page?.metaDescription || 'Learn about SANKOFA - our story, values, and commitment to timeless fashion.',
    }
}

export default async function AboutPage() {
    const page = await getContentPage('about')

    if (!page) {
        return (
            <div className="bg-white text-black">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h1 className="text-3xl font-light tracking-wider uppercase mb-8">About Us</h1>
                    <p className="text-gray-600">
                        Content is being configured. Please check back soon or visit the{' '}
                        <a href="/studio" className="underline">
                            Sanity Studio
                        </a>{' '}
                        to add content.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white text-black">
            {/* Hero Section */}
            {page.hero?.showHero && (
                <section className="relative h-[60vh] md:h-[70vh] bg-neutral-100 flex items-center justify-center">
                    {page.hero.image && (
                        <div className="absolute inset-0">
                            <img
                                src={page.hero.image}
                                alt={page.hero.title || page.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
                        </div>
                    )}
                    <div className="relative text-center px-4 max-w-3xl">
                        {page.hero.title && (
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-[0.2em] uppercase text-white mb-6">
                                {page.hero.title}
                            </h1>
                        )}
                        {page.hero.subtitle && (
                            <p className="text-sm md:text-base tracking-wider text-white/90">
                                {page.hero.subtitle}
                            </p>
                        )}
                    </div>
                </section>
            )}

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                {page.content && (
                    <div className="prose prose-lg max-w-none">
                        <PortableText value={page.content} />
                    </div>
                )}

                {/* Sections */}
                {page.sections && page.sections.length > 0 && (
                    <div className="mt-16 space-y-16">
                        {page.sections.map((section, idx) => (
                            <div key={idx}>
                                {section.heading && (
                                    <h2 className="text-2xl font-light tracking-wider uppercase mb-8">
                                        {section.heading}
                                    </h2>
                                )}
                                <div className="grid md:grid-cols-2 gap-8">
                                    {section.items.map((item, itemIdx) => (
                                        <div key={itemIdx} className="space-y-3">
                                            <h3 className="text-lg font-medium">{item.title}</h3>
                                            <p className="text-gray-600 leading-relaxed">{item.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
