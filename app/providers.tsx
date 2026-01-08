'use client'

import { ThemeProvider } from 'next-themes'
import { ToastProvider } from '@/components/toast-container'
import { CartProvider } from '@/lib/cart-context'
import { WishlistProvider } from '@/lib/wishlist-context'
import { RecentlyViewedProvider } from '@/lib/recently-viewed-context'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ToastProvider>
                <CartProvider>
                    <WishlistProvider>
                        <RecentlyViewedProvider>{children}</RecentlyViewedProvider>
                    </WishlistProvider>
                </CartProvider>
            </ToastProvider>
        </ThemeProvider>
    )
}
