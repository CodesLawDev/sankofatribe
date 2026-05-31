'use client'

import Link from 'next/link'
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { client } from '@/lib/sanity'
import type { FooterData as FooterDataType } from '@/lib/layout-data'

interface FooterLink {
    text: string
    url: string
}

interface FooterSection {
    heading: string
    links: FooterLink[]
}

interface FooterData {
    sections: FooterSection[]
    socialLinks: {
        instagram?: string
        facebook?: string
        twitter?: string
        youtube?: string
        tiktok?: string
    }
    newsletter?: {
        heading: string
        description: string
        buttonText: string
    }
    bottomSection: Array<{
        title: string
        description: string
    }>
    copyrightText: string
    legalLinks: FooterLink[]
    showSections?: boolean
    showSocialLinks?: boolean
    showNewsletter?: boolean
    showBottomSection?: boolean
    showLegalLinks?: boolean
}

function FooterNewsletter({
    heading,
    description,
    buttonText,
}: {
    heading: string
    description: string
    buttonText: string
}) {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        const trimmed = email.trim()
        if (!trimmed) return
        setStatus('loading')
        setMessage('')
        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: trimmed, source: 'footer' }),
            })
            const data = await res.json()
            if (res.ok && data.success) {
                setStatus('success')
                setMessage("You're in! Check your inbox for your 10% code.")
                setEmail('')
            } else {
                setStatus('error')
                setMessage(data.error || 'Something went wrong. Please try again.')
            }
        } catch {
            setStatus('error')
            setMessage('Something went wrong. Please try again.')
        }
    }

    return (
        <div className="border-y border-gray-800 py-12">
            <div className="max-w-md">
                <h3 className="text-sm font-bold mb-4">{heading}</h3>
                <p className="text-xs text-gray-400 mb-4">{description}</p>
                <form className="flex gap-2" onSubmit={handleSubmit}>
                    <label htmlFor="newsletter-email" className="sr-only">
                        Email address
                    </label>
                    <input
                        type="email"
                        id="newsletter-email"
                        name="email"
                        required
                        aria-required="true"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={status === 'loading'}
                        placeholder="Enter your email"
                        className="flex-1 px-3 py-2 text-xs bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-white transition-colors disabled:opacity-60"
                    />
                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="bg-white text-black px-4 py-2 text-xs font-bold hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-60"
                    >
                        {status === 'loading' ? 'Signing up…' : buttonText}
                    </button>
                </form>
                {message && (
                    <p
                        className={`mt-3 text-xs ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}
                        role="status"
                    >
                        {message}
                    </p>
                )}
            </div>
        </div>
    )
}

interface FooterProps {
    /** Pre-fetched footer data from server */
    initialData?: FooterDataType | null
}

export default function Footer({ initialData }: FooterProps = {}) {
    const currentYear = new Date().getFullYear()
    const [footerData, setFooterData] = useState<FooterData | null>(initialData ?? null)

    useEffect(() => {
        // Only fetch client-side if server data was not provided
        if (initialData !== undefined) return

        async function fetchFooterData() {
            try {
                const query = `*[_type == "footerSettings"][0]{
                    _id,
                    title,
                    showSections,
                    showSocialLinks,
                    showBottomSection,
                    showLegalLinks,
                    sections,
                    socialLinks,
                    bottomSection,
                    copyrightText,
                    legalLinks
                }`
                const data = await client.fetch(query)
                setFooterData(data)
            } catch (error) {
                console.error('Error fetching footer data:', error)
                // Set fallback data on error
                setFooterData(null)
            }
        }
        fetchFooterData()
    }, [initialData])

    // Default fallback data
    const defaultData: FooterData = {
        sections: [
            {
                heading: 'Featured',
                links: [
                    { text: 'New Releases', url: '/products?filter=new' },
                    { text: 'Bestsellers', url: '/products?filter=bestsellers' },
                    { text: 'On Sale', url: '/products?filter=sale' },
                    { text: 'All Products', url: '/products' },
                ],
            },
            {
                heading: 'Shop',
                links: [
                    { text: 'Women', url: '/category/women' },
                    { text: 'Men', url: '/category/men' },
                    { text: 'Kids', url: '/products?category=kids' },
                    { text: 'Accessories', url: '/products?category=accessories' },
                ],
            },
            {
                heading: 'Help',
                links: [
                    { text: 'Contact Us', url: '/contact' },
                    { text: 'Shipping & Delivery', url: '/shipping' },
                    { text: 'Returns', url: '/returns' },
                    { text: 'FAQ', url: '/faq' },
                ],
            },
        ],
        socialLinks: {
            instagram: 'https://instagram.com',
            facebook: 'https://facebook.com',
            twitter: 'https://twitter.com',
            youtube: 'https://youtube.com',
            tiktok: 'https://tiktok.com',
        },
        newsletter: {
            heading: 'Email Sign Up',
            description: 'Get 10% off your first order, plus early access to new drops and exclusive offers.',
            buttonText: 'Sign Up',
        },
        bottomSection: [
            { title: 'Find a Store', description: 'Locate our retail locations near you' },
            { title: 'Sustainability', description: 'Learn about our environmental commitment' },
        ],
        copyrightText: '© {year} SANKOFA TRIBE. All rights reserved.',
        legalLinks: [
            { text: 'Privacy Policy', url: '/privacy' },
            { text: 'Terms of Service', url: '/terms' },
        ],
    }

    const showSections = footerData?.showSections ?? true
    const showSocialLinks = footerData?.showSocialLinks ?? true
    const showNewsletter = footerData?.showNewsletter ?? true
    const showBottomSection = footerData?.showBottomSection ?? true
    const showLegalLinks = footerData?.showLegalLinks ?? true

    const newsletter = footerData?.newsletter ?? defaultData.newsletter!
    const sections = footerData?.sections ?? defaultData.sections
    const socialLinks = {
        ...defaultData.socialLinks,
        ...(footerData?.socialLinks || {}),
    }
    const bottomSection = footerData?.bottomSection ?? defaultData.bottomSection
    const legalLinks = footerData?.legalLinks ?? defaultData.legalLinks
    const copyrightText = (footerData?.copyrightText || defaultData.copyrightText).replace('{year}', currentYear.toString())

    return (
        <footer className="bg-black text-white">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
                {showSections && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 py-20">
                        {sections.map((section, idx) => (
                            <div key={idx}>
                                <h4 className="text-xs font-bold uppercase tracking-wider mb-6">{section.heading}</h4>
                                <ul className="space-y-3">
                                    {section.links.map((link, linkIdx) => (
                                        <li key={linkIdx}>
                                            <Link href={link.url} className="text-xs text-gray-400 hover:text-white transition-colors">
                                                {link.text}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {showSocialLinks && (
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider mb-6">Connect</h4>
                                <div className="flex gap-4">
                                    {socialLinks.instagram && (
                                        <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                                            <Instagram className="h-5 w-5" />
                                        </a>
                                    )}
                                    {socialLinks.facebook && (
                                        <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                                            <Facebook className="h-5 w-5" />
                                        </a>
                                    )}
                                    {socialLinks.twitter && (
                                        <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                                            <Twitter className="h-5 w-5" />
                                        </a>
                                    )}
                                    {socialLinks.youtube && (
                                        <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="YouTube">
                                            <Youtube className="h-5 w-5" />
                                        </a>
                                    )}
                                    {socialLinks.tiktok && (
                                        <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="TikTok">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a3 3 0 0 1-3-3v11a7 7 0 1 1-7-7z" />
                                            </svg>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {showNewsletter && (
                    <FooterNewsletter
                        heading={newsletter.heading}
                        description={newsletter.description}
                        buttonText={newsletter.buttonText}
                    />
                )}

                {/* Bottom Section */}
                {showBottomSection && bottomSection && bottomSection.length > 0 && (
                    <div className="py-8 border-b border-gray-800">
                        <div className="grid grid-cols-2 gap-4">
                            {bottomSection.map((item, idx) => (
                                <div key={idx}>
                                    <p className="text-xs font-bold mb-2">{item.title}</p>
                                    <p className="text-xs text-gray-400">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Bottom */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-500">
                        {copyrightText}
                    </p>
                    {showLegalLinks && legalLinks && legalLinks.length > 0 && (
                        <div className="flex gap-6 text-xs">
                            {legalLinks.map((link, idx) => (
                                <Link key={idx} href={link.url} className="text-gray-500 hover:text-white transition-colors">
                                    {link.text}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
                {/* Payment Methods */}
                <div className="mt-8 flex flex-wrap items-center justify-center sm:justify-start gap-3 opacity-60">
                    <span className="text-[10px] uppercase font-semibold text-gray-500 mr-2">Secure Checkout</span>
                    <span className="text-xs font-semibold px-2 py-1 border border-gray-800 rounded bg-black">MTN MoMo</span>
                    <span className="text-xs font-semibold px-2 py-1 border border-gray-800 rounded bg-black">Telecel Cash</span>
                    <span className="text-xs font-semibold px-2 py-1 border border-gray-800 rounded bg-black">VISA</span>
                    <span className="text-xs font-semibold px-2 py-1 border border-gray-800 rounded bg-black">Mastercard</span>
                </div>
            </div>
        </footer>
    )
}
