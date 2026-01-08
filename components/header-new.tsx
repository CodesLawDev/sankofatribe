'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { ShoppingBag, Search, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import SearchModal from './search-modal'
import { client } from '@/lib/sanity'

interface NavItem {
    name: string
    href: string
    external?: boolean
}

interface AnnouncementData {
    text: string
    link?: string
    backgroundColor: string
    textColor: string
    isActive: boolean
}

export default function Header() {
    const { cartCount } = useCart()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [mainNav, setMainNav] = useState<NavItem[]>([
        { name: 'New & Featured', href: '/products' },
        { name: 'Men', href: '/category/men' },
        { name: 'Women', href: '/category/women' },
        { name: 'Kids', href: '/products' },
        { name: 'Sale', href: '/products' },
    ])
    const [announcement, setAnnouncement] = useState<AnnouncementData | null>(null)

    useEffect(() => {
        // Set fallback navigation immediately
        setMainNav([
            { name: 'New & Featured', href: '/products' },
            { name: 'Men', href: '/category/men' },
            { name: 'Women', href: '/category/women' },
            { name: 'Kids', href: '/products' },
            { name: 'Sale', href: '/products' },
        ])

        async function fetchNavigation() {
            try {
                const navQuery = `*[_type == "navigation" && slug.current == "main-nav"][0]{ items }`
                const navData = await client.fetch(navQuery)
                if (navData?.items) {
                    setMainNav(navData.items)
                }
            } catch (error) {
                console.error('Error fetching navigation:', error)
            }
        }

        async function fetchAnnouncement() {
            try {
                const announcementQuery = `*[_type == "announcement"][0]`
                const data = await client.fetch(announcementQuery)
                if (data?.isActive) {
                    setAnnouncement(data)
                }
            } catch (error) {
                console.error('Error fetching announcement:', error)
            }
        }

        fetchNavigation()
        fetchAnnouncement()
    }, [])

    const bgColorMap: Record<string, string> = {
        black: 'bg-black',
        white: 'bg-white',
        gray: 'bg-gray-800',
        brand: 'bg-brand-primary',
    }

    const textColorMap: Record<string, string> = {
        white: 'text-white',
        black: 'text-black',
    }

    return (
        <>
            <header className="sticky top-0 z-50 bg-white text-black">
                {/* Announcement Bar */}
                {announcement && (
                    <div className={`${bgColorMap[announcement.backgroundColor] || 'bg-black'} ${textColorMap[announcement.textColor] || 'text-white'} text-center py-2 px-4`}>
                        {announcement.link ? (
                            <Link href={announcement.link} className="text-xs font-medium hover:opacity-80 transition-opacity">
                                {announcement.text}
                            </Link>
                        ) : (
                            <p className="text-xs font-medium">{announcement.text}</p>
                        )}
                    </div>
                )}

                {/* Main Navigation */}
                <nav className="border-b border-gray-200">
                    <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
                        <div className="flex h-16 items-center justify-between">
                            {/* Logo */}
                            <Link href="/" className="flex-shrink-0">
                                <span className="text-xl font-bold tracking-tight">SANKOFA TRIBE</span>
                            </Link>

                            {/* Desktop Navigation */}
                            <div className="flex items-center gap-8 flex-1 justify-center">
                                {mainNav && mainNav.length > 0 ? (
                                    mainNav.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="text-xs font-medium tracking-wide hover:text-gray-600 transition-colors"
                                        >
                                            {item.name}
                                        </Link>
                                    ))
                                ) : (
                                    <span className="text-gray-400 text-xs">Loading navigation...</span>
                                )}
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-4 lg:gap-6">
                                <button 
                                    onClick={() => setSearchOpen(true)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:p-1" 
                                    aria-label="Search"
                                >
                                    <Search className="h-5 w-5" />
                                </button>
                                <Link
                                    href="/cart"
                                    className="relative p-2 hover:bg-gray-100 rounded-full transition-colors lg:p-1"
                                    aria-label="Shopping bag"
                                >
                                    <ShoppingBag className="h-5 w-5" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-medium">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                                {/* Mobile Menu Button */}
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    aria-label="Toggle menu"
                                >
                                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-gray-200">
                        <div className="px-4 sm:px-6 py-6 space-y-4">
                            {mainNav.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block text-sm font-medium hover:text-gray-600 transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            {/* Search Modal */}
            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    )
}
