import Link from 'next/link'
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-brand-cream border-t border-neutral-100 mt-32">
            {/* Newsletter Section */}
            <div className="border-b border-neutral-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
                    <div className="max-w-md mx-auto text-center">
                        <h3 className="text-xs uppercase tracking-[0.2em] font-medium mb-4">Stay Informed</h3>
                        <p className="text-xs text-neutral-600 mb-6">Sign up for exclusive offers and updates</p>
                        <form className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="flex-1 px-4 py-3 border border-brand-primary text-xs uppercase tracking-wider focus:outline-none bg-brand-cream text-brand-dark"
                            />
                            <button className="bg-brand-primary text-white px-6 py-3 text-xs uppercase tracking-wider hover:bg-neutral-700 transition-colors">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
                    {/* Shop */}
                    <div>
                        <h3 className="text-xs uppercase tracking-[0.2em] font-medium mb-6">Shop</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/category/women" className="text-xs text-neutral-600 hover:text-brand-dark transition-colors">
                                    Women
                                </Link>
                            </li>
                            <li>
                                <Link href="/category/men" className="text-xs text-neutral-600 hover:text-brand-dark transition-colors">
                                    Men
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="text-xs text-neutral-600 hover:text-brand-dark transition-colors">
                                    All Products
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div>
                        <h3 className="text-xs uppercase tracking-[0.2em] font-medium mb-6">Customer Care</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/contact" className="text-xs text-neutral-600 hover:text-brand-dark transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/shipping" className="text-xs text-neutral-600 hover:text-brand-dark transition-colors">
                                    Shipping & Delivery
                                </Link>
                            </li>
                            <li>
                                <Link href="/returns" className="text-xs text-neutral-600 hover:text-brand-dark transition-colors">
                                    Returns & Exchanges
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-xs text-neutral-600 hover:text-brand-dark transition-colors">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-xs uppercase tracking-[0.2em] font-medium mb-6">Company</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/about" className="text-xs text-neutral-600 hover:text-brand-dark transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/careers" className="text-xs text-neutral-600 hover:text-brand-dark transition-colors">
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link href="/sustainability" className="text-xs text-neutral-600 hover:text-brand-dark transition-colors">
                                    Sustainability
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="text-xs uppercase tracking-[0.2em] font-medium mb-6">Connect</h3>
                        <div className="flex gap-4">
                            <a href="#" className="hover:opacity-60 transition-opacity" aria-label="Instagram">
                                <Instagram className="h-5 w-5" strokeWidth={1.5} />
                            </a>
                            <a href="#" className="hover:opacity-60 transition-opacity" aria-label="Facebook">
                                <Facebook className="h-5 w-5" strokeWidth={1.5} />
                            </a>
                            <a href="#" className="hover:opacity-60 transition-opacity" aria-label="Twitter">
                                <Twitter className="h-5 w-5" strokeWidth={1.5} />
                            </a>
                            <a href="#" className="hover:opacity-60 transition-opacity" aria-label="YouTube">
                                <Youtube className="h-5 w-5" strokeWidth={1.5} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-neutral-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-neutral-600">
                            © {currentYear} SANKOFA. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            <Link href="/privacy" className="text-xs text-neutral-600 hover:text-brand-dark transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-xs text-neutral-600 hover:text-brand-dark transition-colors">
                                Terms of Service
                            </Link>
                            <Link href="/accessibility" className="text-xs text-neutral-600 hover:text-brand-dark transition-colors">
                                Accessibility
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
