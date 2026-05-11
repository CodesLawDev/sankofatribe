import type { Metadata } from 'next'
import { getTextPage, TextPageData } from '@/lib/content'
import ContactFormClient from '@/components/contact-form-client'

export const metadata: Metadata = {
    title: 'Contact Us | SANKOFA TRIBE',
    description: 'Get in touch with SANKOFA TRIBE. Send us a message or visit our contact page for inquiries, support, and wholesale opportunities.',
    openGraph: {
        title: 'Contact Us | SANKOFA TRIBE',
        description: 'Get in touch with SANKOFA TRIBE for inquiries and support.',
        type: 'website',
    },
}

async function getContactPageData(): Promise<TextPageData | null> {
    try {
        const data = await getTextPage('contact')
        return data
    } catch (error) {
        console.error('Failed to fetch contact page data:', error)
        return null
    }
}

export default async function ContactPage() {
    const pageData = await getContactPageData()

    return (
        <div className="bg-white text-black">
            {/* Hero Section */}
            <section className="bg-brand-cream py-20 md:py-32 text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h1 className="text-3xl md:text-5xl font-light tracking-[0.2em] uppercase mb-6">
                        {pageData?.title || 'Contact Us'}
                    </h1>
                </div>
            </section>

            {/* Contact Form Client Component */}
            <ContactFormClient pageData={pageData} />
        </div>
    )
}
