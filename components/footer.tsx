'use client'

import Link from 'next/link'
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react'
import { useEffect, useState } from 'react'
import { client } from '@/lib/sanity'

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
    }
    newsletter: {
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
}

export default function Footer() {
    const currentYear = new Date().getFullYear()
    const [footerData, setFooterData] = useState<FooterData | null>(null)
    const [newsletterEmail, setNewsletterEmail] = useState('')
    const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [newsletterMessage, setNewsletterMessage] = useState('')

    useEffect(() => {
        async function fetchFooterData() {
            try {
                const query = `*[_type == "footerSettings"][0]`
                const data = await client.fetch(query)
                setFooterData(data)
            } catch (error) {
                console.error('Error fetching footer data:', error)
            }
        }
        fetchFooterData()
    }, [])

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setNewsletterStatus('loading')

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: newsletterEmail,
                    source: 'footer',
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setNewsletterStatus('error')
                setNewsletterMessage(data.error || 'Failed to subscribe. Please try again.')
                return
            }

            setNewsletterStatus('success')
            setNewsletterMessage(data.message || 'Successfully subscribed! Check your email.')
            setNewsletterEmail('')

            // Reset success message after 5 seconds
            setTimeout(() => {
                setNewsletterStatus('idle')
                setNewsletterMessage('')
            }, 5000)
        } catch (error) {
            console.error('Newsletter subscription error:', error)
            setNewsletterStatus('error')
            setNewsletterMessage('An error occurred. Please try again.')
        }
    }

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
        },
        newsletter: {
            heading: 'Email Sign Up',
            description: 'Get the latest product launches, exclusive offers, and updates',
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

    const sections = footerData?.sections ?? defaultData.sections
    const socialLinks = {
        ...defaultData.socialLinks,
        ...(footerData?.socialLinks || {}),
    }
    const newsletter = footerData?.newsletter ?? defaultData.newsletter
    const bottomSection = footerData?.bottomSection ?? defaultData.bottomSection
    const legalLinks = footerData?.legalLinks ?? defaultData.legalLinks
    const copyrightText = (footerData?.copyrightText || defaultData.copyrightText).replace('{year}', currentYear.toString())

    return (
        <footer className="bg-black text-white">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
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

                    {/* Connect - Social Media */}
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
                        </div>
                    </div>
                </div>

                {/* Newsletter */}
                <div className="border-y border-gray-800 py-12">
                    <div className="max-w-md">
                        <h3 className="text-sm font-bold mb-4">{newsletter.heading}</h3>
                        <p className="text-xs text-gray-400 mb-4">
                            {newsletter.description}
                        </p>
                        
                        {newsletterStatus === 'success' ? (
                            <div className="p-3 bg-green-900/20 border border-green-800 rounded text-xs text-green-400 mb-4">
                                ✅ {newsletterMessage}
                            </div>
                        ) : newsletterStatus === 'error' ? (
                            <div className="p-3 bg-red-900/20 border border-red-800 rounded text-xs text-red-400 mb-4">
                                ❌ {newsletterMessage}
                            </div>
                        ) : null}

                        <form className="flex gap-2" onSubmit={handleNewsletterSubmit}>
                            <label htmlFor="newsletter-email" className="sr-only">
                                Email address
                            </label>
                            <input
                                type="email"
                                id="newsletter-email"
                                name="email"
                                required
                                aria-required="true"
                                placeholder="Enter your email"
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                disabled={newsletterStatus === 'loading'}
                                className="flex-1 px-3 py-2 text-xs bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-white transition-colors disabled:opacity-50"
                            />
                            <button 
                                type="submit"
                                disabled={newsletterStatus === 'loading'}
                                className="bg-white text-black px-4 py-2 text-xs font-bold hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50"
                            >
                                {newsletterStatus === 'loading' ? 'Subscribing...' : newsletter.buttonText}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Section */}
                {bottomSection && bottomSection.length > 0 && (
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
                    {legalLinks && legalLinks.length > 0 && (
                        <div className="flex gap-6 text-xs">
                            {legalLinks.map((link, idx) => (
                                <Link key={idx} href={link.url} className="text-gray-500 hover:text-white transition-colors">
                                    {link.text}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </footer>
    )
}
