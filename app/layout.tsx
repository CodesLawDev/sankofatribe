import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { CartProvider } from '@/lib/cart-context'

export const metadata: Metadata = {
    title: 'SANKOFA - Premium Fashion',
    description: 'Discover timeless style and premium quality. Shop the latest collections from SANKOFA.',
    keywords: 'fashion, clothing, premium, luxury, sankofa, designer, lifestyle',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <CartProvider>
                    <Header />
                    <main className="min-h-screen">{children}</main>
                    <Footer />
                </CartProvider>
            </body>
        </html>
    )
}
