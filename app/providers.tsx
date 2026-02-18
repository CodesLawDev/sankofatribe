'use client'

import { ThemeProvider } from 'next-themes'
import { ToastProvider } from '@/components/toast-container'
import { CartProvider } from '@/lib/cart-context'
import { WishlistProvider } from '@/lib/wishlist-context'
import { RecentlyViewedProvider } from '@/lib/recently-viewed-context'
import { CurrencyProvider } from '@/lib/currency-context'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
            <ToastProvider>
                <CartProvider>
                    <WishlistProvider>
                        <RecentlyViewedProvider>
                            <CurrencyProvider>
                                {children}
                            </CurrencyProvider>
                        </RecentlyViewedProvider>
                    </WishlistProvider>
                </CartProvider>
            </ToastProvider>
        </ThemeProvider>
    )
}
