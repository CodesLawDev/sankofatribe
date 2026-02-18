'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { ShoppingBag, Search, Menu, X, Heart, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import SearchModal from './search-modal'
import { client } from '@/lib/sanity'
import type { NavItem as NavItemType, AnnouncementData as AnnouncementType } from '@/lib/layout-data'

interface HeaderProps {
    /** Pre-fetched navigation items from server */
    initialNavItems?: NavItemType[]
    /** Pre-fetched announcement from server */
    initialAnnouncement?: AnnouncementType | null
}

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

const DEFAULT_NAV: NavItem[] = [
    { name: 'New & Featured', href: '/products' },
    { name: 'Men', href: '/category/men' },
    { name: 'Women', href: '/category/women' },
    { name: 'Kids', href: '/products' },
    { name: 'Sale', href: '/products' },
    { name: 'Events', href: '/events' },
]

export default function Header({ initialNavItems, initialAnnouncement }: HeaderProps = {}) {
    const { cartCount } = useCart()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [mainNav, setMainNav] = useState<NavItem[]>(initialNavItems ?? DEFAULT_NAV)
    const [announcement, setAnnouncement] = useState<AnnouncementData | null>(initialAnnouncement ?? null)

    useEffect(() => {
        // Only fetch client-side if server data was not provided
        if (initialNavItems && initialAnnouncement !== undefined) return

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

    // Close mobile menu when a link is clicked
    const closeMobileMenu = () => setMobileMenuOpen(false)

    return (
        <>
            <header className="sticky top-0 z-50 bg-white text-black shadow-sm">
                {/* Announcement Bar */}
                {announcement && (
                    <div className={`${bgColorMap[announcement.backgroundColor] || 'bg-black'} ${textColorMap[announcement.textColor] || 'text-white'} text-center py-2 px-4`}>
                        {announcement.link ? (
                            <Link href={announcement.link} className="text-xs sm:text-sm font-medium hover:opacity-80 transition-opacity inline-block">
                                {announcement.text}
                            </Link>
                        ) : (
                            <p className="text-xs sm:text-sm font-medium">{announcement.text}</p>
                        )}
                    </div>
                )}

                {/* Main Navigation */}
                <nav className="border-b border-gray-100">
                    <div className="mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
                            {/* Mobile Menu Button - Left (moved to right) */}
                            {/* Removed from left to place in right actions */}

                            {/* Logo */}
                            <Link 
                                href="/" 
                                className="flex-shrink-0 font-bold tracking-tight text-sm sm:text-base md:text-lg whitespace-nowrap"
                                onClick={closeMobileMenu}
                            >
                                SANKOFA
                            </Link>

                            {/* Desktop Navigation - Center */}
                            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
                                {mainNav && mainNav.length > 0 ? (
                                    mainNav.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="px-3 py-2 text-xs font-medium tracking-wide text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-all duration-200"
                                        >
                                            {item.name}
                                        </Link>
                                    ))
                                ) : null}
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                {/* Search - Hide on very small screens */}
                                <button 
                                    onClick={() => setSearchOpen(true)}
                                    className="hidden xs:flex p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-700 hover:text-black" 
                                    aria-label="Search"
                                    title="Search"
                                >
                                    <Search className="h-5 w-5 sm:h-5 sm:w-5" strokeWidth={1.5} />
                                </button>

                                {/* Wishlist - Desktop only */}
                                <Link
                                    href="/wishlist"
                                    className="hidden sm:flex p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-700 hover:text-black"
                                    aria-label="Wishlist"
                                    title="Wishlist"
                                >
                                    <Heart className="h-5 w-5" strokeWidth={1.5} />
                                </Link>

                                {/* Account - Desktop only */}
                                <Link
                                    href="/account"
                                    className="hidden sm:flex p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-700 hover:text-black"
                                    aria-label="Account"
                                    title="Account"
                                >
                                    <User className="h-5 w-5" strokeWidth={1.5} />
                                </Link>

                                {/* Cart */}
                                <Link
                                    href="/cart"
                                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-700 hover:text-black"
                                    aria-label="Shopping bag"
                                    title="Shopping bag"
                                >
                                    <ShoppingBag className="h-5 w-5 sm:h-5 sm:w-5" strokeWidth={1.5} />
                                    {cartCount > 0 && (
                                        <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Mobile Menu Toggle - placed last so it's first from the right */}
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="lg:hidden flex-shrink-0 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                    aria-label="Toggle menu"
                                    title="Menu"
                                >
                                    {mobileMenuOpen ? (
                                        <X className="h-6 w-6" strokeWidth={1.5} />
                                    ) : (
                                        <Menu className="h-6 w-6" strokeWidth={1.5} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Mobile Menu - Dropdown */}
                {mobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-4 space-y-2 max-h-[calc(100vh-140px)] overflow-y-auto">
                            {/* Mobile Navigation Links */}
                            <div className="space-y-1 mb-4 pb-4 border-b border-gray-100">
                                {mainNav && mainNav.length > 0 ? (
                                    mainNav.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="block px-3 py-3 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                                            onClick={closeMobileMenu}
                                        >
                                            {item.name}
                                        </Link>
                                    ))
                                ) : null}
                            </div>

                            {/* Mobile Additional Actions */}
                            <div className="space-y-1">
                                <button 
                                    onClick={() => {
                                        setSearchOpen(true)
                                        closeMobileMenu()
                                    }}
                                    className="w-full text-left px-3 py-3 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                                >
                                    <Search className="h-5 w-5" strokeWidth={1.5} />
                                    Search
                                </button>
                                <Link
                                    href="/wishlist"
                                    className="block px-3 py-3 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                                    onClick={closeMobileMenu}
                                >
                                    <div className="flex items-center gap-3">
                                        <Heart className="h-5 w-5" strokeWidth={1.5} />
                                        Wishlist
                                    </div>
                                </Link>
                                <Link
                                    href="/account"
                                    className="block px-3 py-3 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                                    onClick={closeMobileMenu}
                                >
                                    <div className="flex items-center gap-3">
                                        <User className="h-5 w-5" strokeWidth={1.5} />
                                        Account
                                    </div>
                                </Link>
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
