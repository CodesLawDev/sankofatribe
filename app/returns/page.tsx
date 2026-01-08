import { getContentPage } from '@/lib/content'
import { PortableText } from '@portabletext/react'

export async function generateMetadata() {
    const page = await getContentPage('returns')
    return {
        title: page?.title ? `${page.title} - SANKOFA` : 'Returns & Exchanges - SANKOFA',
        description: page?.metaDescription || 'Learn about SANKOFA return and exchange policies.',
    }
}

export default async function ReturnsPage() {
    const page = await getContentPage('returns')

    if (!page) {
        return (
            <div className="bg-white text-black">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h1 className="text-3xl font-light tracking-wider uppercase mb-8">Returns & Exchanges</h1>
                    <p className="text-gray-600">
                        Content is being configured. Please add returns content in the{' '}
                        <a href="/studio" className="underline">
                            Sanity Studio
                        </a>
                        .
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white text-black">
            {/* Hero Section */}
            {page.hero?.showHero && (
                <section className="bg-brand-cream py-20 md:py-32 text-center">
                    <div className="max-w-3xl mx-auto px-4">
                        <h1 className="text-3xl md:text-5xl font-light tracking-[0.2em] uppercase mb-6">
                            {page.hero.title || page.title}
                        </h1>
                        {page.hero.subtitle && (
                            <p className="text-sm text-gray-600 tracking-wide">{page.hero.subtitle}</p>
                        )}
                    </div>
                </section>
            )}

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {page.content && (
                    <div className="prose prose-lg max-w-none mb-16">
                        <PortableText value={page.content} />
                    </div>
                )}

                {/* Sections */}
                {page.sections && page.sections.map((section, idx) => (
                    <div key={idx} className="mb-16">
                        {section.heading && (
                            <h2 className="text-2xl font-light tracking-wider uppercase mb-8 pb-4 border-b">
                                {section.heading}
                            </h2>
                        )}
                        <div className="space-y-8">
                            {section.items.map((item, itemIdx) => (
                                <div key={itemIdx}>
                                    <h3 className="text-lg font-medium mb-3">{item.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{item.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
