import { Metadata } from 'next'
import { getFAQPage } from '@/lib/content'
import { FAQAccordion } from '@/components/faq-accordion'

export const metadata: Metadata = {
    title: 'FAQ | SANKOFA TRIBE',
    description: 'Find answers to frequently asked questions about SANKOFA TRIBE products, orders, shipping, and returns.',
}

export default async function FAQPage() {
    const pageData = await getFAQPage()

    if (!pageData) {
        return (
            <div className="bg-white text-black">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h1 className="text-3xl font-light tracking-wider uppercase mb-8">Frequently Asked Questions</h1>
                    <p className="text-gray-600">
                        Content is being configured. Please add an FAQ document in the{' '}
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
            <section className="bg-brand-cream py-20 md:py-32 text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h1 className="text-3xl md:text-5xl font-light tracking-[0.2em] uppercase mb-6">
                        {pageData.title}
                    </h1>
                    {pageData.description && (
                        <p className="text-sm text-gray-600 tracking-wide">{pageData.description}</p>
                    )}
                </div>
            </section>

            {/* FAQ List */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div>
                    {pageData.faqs?.map((item, idx) => (
                        <FAQAccordion 
                            key={idx} 
                            item={{
                                title: item.question,
                                content: item.answer
                            }} 
                        />
                    ))}
                    
                    {(!pageData.faqs || pageData.faqs.length === 0) && (
                         <p className="text-center text-gray-500">No questions added yet.</p>
                    )}
                </div>

                {/* Contact CTA */}
                <div className="mt-16 text-center bg-gray-50 py-12 px-6">
                    <h3 className="text-lg font-medium mb-3">Still have questions?</h3>
                    <p className="text-sm text-gray-600 mb-6">
                        Can&apos;t find the answer you&apos;re looking for? Our customer support team is here to help.
                    </p>
                    <a
                        href="/contact"
                        className="inline-block bg-black text-white px-6 py-3 text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
                    >
                        Contact Us
                    </a>
                </div>
            </div>
        </div>
    )
}
