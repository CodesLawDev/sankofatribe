/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { getContentPage, ContentPageData } from '@/lib/content'

interface FAQItem {
    title: string
    content: string
}

interface FAQSection {
    heading: string
    items: FAQItem[]
}

function FAQAccordion({ item }: { item: FAQItem }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border-b border-gray-100">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left hover:opacity-70 transition-opacity"
            >
                <span className="text-sm font-medium pr-8">{item.title}</span>
                {isOpen ? (
                    <ChevronUp className="h-4 w-4 flex-shrink-0" />
                ) : (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                )}
            </button>
            {isOpen && (
                <div className="pb-6 text-sm text-gray-600 leading-relaxed">
                    {item.content}
                </div>
            )}
        </div>
    )
}

export default function FAQPage() {
    const [pageData, setPageData] = useState<ContentPageData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            const data = await getContentPage('faq')
            setPageData(data)
            setLoading(false)
        }
        loadData()
    }, [])

    if (loading) {
        return (
            <div className="bg-white text-black">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                </div>
            </div>
        )
    }

    if (!pageData) {
        return (
            <div className="bg-white text-black">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h1 className="text-3xl font-light tracking-wider uppercase mb-8">Frequently Asked Questions</h1>
                    <p className="text-gray-600">
                        Content is being configured. Please add FAQ content in the{' '}
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
            {pageData.hero?.showHero && (
                <section className="bg-brand-cream py-20 md:py-32 text-center">
                    <div className="max-w-3xl mx-auto px-4">
                        <h1 className="text-3xl md:text-5xl font-light tracking-[0.2em] uppercase mb-6">
                            {pageData.hero.title || pageData.title}
                        </h1>
                        {pageData.hero.subtitle && (
                            <p className="text-sm text-gray-600 tracking-wide">{pageData.hero.subtitle}</p>
                        )}
                    </div>
                </section>
            )}

            {/* FAQ Sections */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {pageData.sections && pageData.sections.map((section, idx) => (
                    <div key={idx} className="mb-16">
                        {section.heading && (
                            <h2 className="text-xl font-light tracking-wider uppercase mb-8 pb-4 border-b">
                                {section.heading}
                            </h2>
                        )}
                        <div>
                            {section.items.map((item, itemIdx) => (
                                <FAQAccordion key={itemIdx} item={item} />
                            ))}
                        </div>
                    </div>
                ))}

                {/* Contact CTA */}
                <div className="mt-16 text-center bg-gray-50 py-12 px-6">
                    <h3 className="text-lg font-medium mb-3">Still have questions?</h3>
                    <p className="text-sm text-gray-600 mb-6">
                        Can't find the answer you're looking for? Our customer support team is here to help.
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
