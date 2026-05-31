'use client'

import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { ShoppingBag, Search, Menu, X, Heart, User, LogOut, Settings } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import SearchModal from './search-modal'
import Image from 'next/image'
import { client } from '@/lib/sanity'
import type { NavItem as NavItemType, AnnouncementData as AnnouncementType } from '@/lib/layout-data'

interface HeaderProps {
    /** Pre-fetched navigation items from server */
    initialNavItems?: NavItemType[]
    /** Pre-fetched announcement from server */
    initialAnnouncement?: AnnouncementType | null
}

interface AnnouncementData {
    text: string
    link?: string
    backgroundColor: string
    textColor: string
    isActive: boolean
}

interface UserProfile {
    id: string
    email: string
    firstName: string
    lastName: string
}

const DEFAULT_NAV: NavItemType[] = [
    { name: 'New & Featured', href: '/products' },
    { name: 'Men', href: '/category/men' },
    { name: 'Women', href: '/category/women' },
    { name: 'Kids', href: '/products' },
    { name: 'Sale', href: '/products' },
    { name: 'Events', href: '/events' },
    { name: 'Reviews', href: '/reviews' },
]

export default function Header({ initialNavItems, initialAnnouncement }: HeaderProps = {}) {
    const { cartCount } = useCart()
    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [mainNav, setMainNav] = useState<NavItemType[]>(initialNavItems ?? DEFAULT_NAV)
    const [announcement, setAnnouncement] = useState<AnnouncementData | null>(initialAnnouncement ?? null)
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const authCheckedRef = useRef(false)

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
    }, [initialNavItems, initialAnnouncement])

    useEffect(() => {
        if (authCheckedRef.current) return
        authCheckedRef.current = true

        async function checkUserAuth() {
            try {
                const response = await fetch('/api/auth/status', { credentials: 'include' })
                if (!response.ok) return
                const data = await response.json()
                if (data?.authenticated) {
                    const meResponse = await fetch('/api/auth/me', { credentials: 'include' })
                    if (meResponse.ok) {
                        const meData = await meResponse.json()
                        setUserProfile(meData.user)
                    }
                }
            } catch (error) {
                // Not authenticated - silent fail
            }
        }

        checkUserAuth()
    }, [])

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true)
            await fetch('/api/auth/logout', { method: 'POST' })
            setUserProfile(null)
            setShowUserMenu(false)
            router.push('/login')
        } catch (error) {
            console.error('Logout failed:', error)
        } finally {
            setIsLoggingOut(false)
        }
    }

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
                                className="flex-shrink-0 flex items-center"
                                onClick={closeMobileMenu}
                                aria-label="Sankofa Tribe Home"
                            >
                                <div className="relative h-10 w-10 sm:h-12 sm:w-12">
                                    <Image 
                                        src="/logo.png" 
                                        alt="Sankofa Tribe Logo" 
                                        fill
                                        sizes="(max-width: 640px) 40px, 48px"
                                        className="object-contain"
                                        priority
                                    />
                                </div>
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

                                {/* User Menu - Desktop only */}
                                <div className="hidden sm:block relative">
                                    {userProfile ? (
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowUserMenu(!showUserMenu)}
                                                className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-700 hover:text-black flex items-center gap-2"
                                                aria-label="User menu"
                                            >
                                                <User className="h-5 w-5" strokeWidth={1.5} />
                                                <span className="text-xs font-medium hidden md:inline max-w-[80px] truncate">
                                                    {userProfile.firstName}
                                                </span>
                                            </button>

                                            {showUserMenu && (
                                                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="px-4 py-3 border-b border-gray-100">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {userProfile.firstName} {userProfile.lastName}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">{userProfile.email}</p>
                                                    </div>

                                                    <div className="py-2">
                                                        <Link
                                                            href="/account"
                                                            onClick={() => setShowUserMenu(false)}
                                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <User className="h-4 w-4" />
                                                            My Account
                                                        </Link>
                                                        <Link
                                                            href="/account?tab=orders"
                                                            onClick={() => setShowUserMenu(false)}
                                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <ShoppingBag className="h-4 w-4" />
                                                            Orders
                                                        </Link>
                                                        <Link
                                                            href="/account?tab=wishlist"
                                                            onClick={() => setShowUserMenu(false)}
                                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <Heart className="h-4 w-4" />
                                                            Wishlist
                                                        </Link>
                                                        <Link
                                                            href="/account?tab=security"
                                                            onClick={() => setShowUserMenu(false)}
                                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <Settings className="h-4 w-4" />
                                                            Settings
                                                        </Link>
                                                    </div>

                                                    <div className="border-t border-gray-100 py-2">
                                                        <button
                                                            onClick={handleLogout}
                                                            disabled={isLoggingOut}
                                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                        >
                                                            <LogOut className="h-4 w-4" />
                                                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <Link
                                            href="/login"
                                            className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-700 hover:text-black flex items-center gap-2"
                                            aria-label="Login"
                                            title="Login"
                                        >
                                            <User className="h-5 w-5" strokeWidth={1.5} />
                                            <span className="text-xs font-medium hidden md:inline">Login</span>
                                        </Link>
                                    )}
                                </div>

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

                                {/* Auth Section */}
                                {userProfile ? (
                                    <>
                                        <div className="px-3 py-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {userProfile.firstName} {userProfile.lastName}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">{userProfile.email}</p>
                                        </div>
                                        <Link
                                            href="/account"
                                            className="block px-3 py-3 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                                            onClick={closeMobileMenu}
                                        >
                                            <div className="flex items-center gap-3">
                                                <User className="h-5 w-5" strokeWidth={1.5} />
                                                My Account
                                            </div>
                                        </Link>
                                        <Link
                                            href="/account?tab=orders"
                                            className="block px-3 py-3 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                                            onClick={closeMobileMenu}
                                        >
                                            <div className="flex items-center gap-3">
                                                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                                                Orders
                                            </div>
                                        </Link>
                                        <Link
                                            href="/account?tab=security"
                                            className="block px-3 py-3 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                                            onClick={closeMobileMenu}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Settings className="h-5 w-5" strokeWidth={1.5} />
                                                Settings
                                            </div>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout()
                                                closeMobileMenu()
                                            }}
                                            disabled={isLoggingOut}
                                            className="w-full text-left px-3 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-3"
                                        >
                                            <LogOut className="h-5 w-5" strokeWidth={1.5} />
                                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="block px-3 py-3 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                                            onClick={closeMobileMenu}
                                        >
                                            <div className="flex items-center gap-3">
                                                <User className="h-5 w-5" strokeWidth={1.5} />
                                                Login
                                            </div>
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="block px-3 py-3 text-sm font-medium bg-black text-white text-center rounded-lg hover:bg-gray-800 transition-colors"
                                            onClick={closeMobileMenu}
                                        >
                                            Sign Up
                                        </Link>
                                    </>
                                )}
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
