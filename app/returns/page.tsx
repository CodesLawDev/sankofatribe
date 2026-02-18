import { getTextPage } from '@/lib/content'
import { PortableText } from '@portabletext/react'

export async function generateMetadata() {
    const page = await getTextPage('returns')
    return {
        title: page?.title ? `${page.title} - SANKOFA` : 'Returns & Exchanges - SANKOFA',
        description: 'Learn about SANKOFA return and exchange policies.',
    }
}

export default async function ReturnsPage() {
    const page = await getTextPage('returns')

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
            {/* Hero Section - Simplified */}
            <section className="bg-brand-cream py-20 md:py-32 text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h1 className="text-3xl md:text-5xl font-light tracking-[0.2em] uppercase mb-6">
                        {page.title}
                    </h1>
                </div>
            </section>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {page.content && (
                    <div className="prose prose-lg max-w-none">
                        <PortableText value={page.content} />
                    </div>
                )}
            </div>
        </div>
    )
}
