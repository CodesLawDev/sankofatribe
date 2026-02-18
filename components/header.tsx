'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { ShoppingBag, Search, Menu, X, User, Heart } from 'lucide-react'
import { useState } from 'react'
import SearchModal from './search-modal'

export default function Header() {
    const { cartCount } = useCart()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)

    const navigation = [
        { name: 'Women', href: '/category/women' },
        { name: 'Men', href: '/category/men' },
        { name: 'Shop All', href: '/products' },
        { name: 'Events', href: '/events' },
    ]

    return (
        <>
            {/* Top Banner */}
            <div className="bg-brand-primary text-white text-center py-2 px-4">
                <p className="text-xs uppercase tracking-widest">Free Shipping on Orders Over $100</p>
            </div>

            <header className="sticky top-0 z-50 bg-brand-cream">
                <nav className="border-b border-gray-100 relative">
                    <div className="flex h-20 items-center justify-between">
                        {/* Center - Logo */}
                        <div className="absolute left-1/2 transform -translate-x-1/2">
                            <Link href="/" className="flex items-center">
                                <h1 className="text-2xl lg:text-3xl font-light tracking-[0.3em] uppercase">SANKOFA</h1>
                            </Link>
                        </div>

                        {/* Spacer for centering logo */}
                        <div className="flex-1" />

                        {/* Right icons */}
                        <div className="flex items-center gap-6 pr-12 lg:pr-0">
                            <button 
                                onClick={() => setSearchOpen(true)}
                                className="hidden sm:block hover:opacity-60 transition-opacity" 
                                aria-label="Search"
                            >
                                <Search className="h-5 w-5" strokeWidth={1.5} />
                            </button>
                            <Link href="/wishlist" className="hidden sm:block hover:opacity-60 transition-opacity" aria-label="Wishlist">
                                <Heart className="h-5 w-5" strokeWidth={1.5} />
                            </Link>
                            <Link href="/account" className="hidden sm:block hover:opacity-60 transition-opacity" aria-label="Account">
                                <User className="h-5 w-5" strokeWidth={1.5} />
                            </Link>
                            <Link
                                href="/cart"
                                className="relative hover:opacity-60 transition-opacity"
                                aria-label="Shopping bag"
                            >
                                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-brand-primary text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                        
                        {/* Mobile menu button - Absolute Right */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="absolute right-4 lg:hidden p-2 hover:opacity-60 transition-opacity"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                            
                            {/* Mobile menu button - Extreme Right */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 hover:opacity-60 transition-opacity ml-auto"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                    </div>

                    {/* Secondary Desktop Navigation */}
                    <div className="hidden lg:flex justify-center gap-12 pb-4 border-b border-gray-100">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-xs font-medium uppercase tracking-[0.2em] hover:opacity-60 transition-opacity"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 top-[88px] bg-white z-40 overflow-y-auto">
                        <div className="px-6 py-8">
                            <div className="space-y-6">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="block text-lg font-light uppercase tracking-[0.2em] hover:opacity-60 transition-opacity"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Search Modal */}
            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    )
}
