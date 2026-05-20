import type { Metadata, Viewport } from 'next'
import './globals.css'
import Header from '@/components/header-new'
import Footer from '@/components/footer'
import { Providers } from './providers'
import AnalyticsTracker from '@/components/analytics-tracker'
import PullToRefresh from '@/components/pull-to-refresh'
import WhatsappButton from '@/components/whatsapp-button'
import NewsletterPopup from '@/components/newsletter-popup'
import { fetchLayoutData } from '@/lib/layout-data'

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
    maximumScale: 5,
    themeColor: '#ffffff',
}

export const metadata: Metadata = {
    metadataBase: new URL('https://sankofatribe.com'),
    title: 'SANKOFA TRIBE - Premium Fashion',
    description: 'Discover timeless style and premium quality. Shop the latest collections from SANKOFA TRIBE.',
    keywords: 'fashion, clothing, premium, luxury, sankofa tribe, designer, lifestyle',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'SANKOFA TRIBE',
    },
    icons: {
        icon: '/logo.svg',
        apple: '/logo.svg',
    },
    openGraph: {
        type: 'website',
        url: 'https://sankofatribe.com',
        title: 'SANKOFA TRIBE - Premium Fashion',
        description: 'Discover timeless style and premium quality. Shop the latest collections from SANKOFA TRIBE.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'SANKOFA TRIBE - Premium Fashion',
        description: 'Discover timeless style and premium quality. Shop the latest collections from SANKOFA TRIBE.',
        images: ['/og-image.png'],
    },
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const layoutData = await fetchLayoutData()

    return (
        <html lang="en" suppressHydrationWarning>
            <body className="bg-white text-black">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'Organization',
                            name: 'SANKOFA TRIBE',
                            url: 'https://sankofatribe.com',
                            logo: 'https://sankofatribe.com/og-image.png',
                            description: 'Discover timeless style and premium quality. Shop the latest collections from SANKOFA TRIBE.',
                        }),
                    }}
                />
                <Providers>
                    <AnalyticsTracker />
                    <PullToRefresh />
                    <WhatsappButton />
                    <NewsletterPopup />
                    <Header initialNavItems={layoutData.navItems} initialAnnouncement={layoutData.announcement} />
                    <main className="min-h-screen">{children}</main>
                    <Footer initialData={layoutData.footerData} />
                </Providers>
            </body>
        </html>
    )
}
