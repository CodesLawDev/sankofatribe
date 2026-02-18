import type { Metadata, Viewport } from 'next'
import './globals.css'
import Header from '@/components/header-new'
import Footer from '@/components/footer'
import { Providers } from './providers'
import AnalyticsTracker from '@/components/analytics-tracker'
import PullToRefresh from '@/components/pull-to-refresh'

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
    maximumScale: 5,
    themeColor: '#ffffff',
}

export const metadata: Metadata = {
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
                url: '/logo.svg',
                width: 1200,
                height: 630,
            },
        ],
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="bg-white text-black">
                <Providers>
                    <AnalyticsTracker />
                    <PullToRefresh />
                    <Header />
                    <main className="min-h-screen">{children}</main>
                    <Footer />
                </Providers>
            </body>
        </html>
    )
}
