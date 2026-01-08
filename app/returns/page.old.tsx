/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link'

export const metadata = {
    title: 'Returns & Exchanges - SANKOFA',
    description: 'Learn about SANKOFA return policy, exchange process, and refund information.',
}

export default function ReturnsPage() {
    return (
        <div className="bg-white text-black">
            {/* Hero Section */}
            <section className="bg-brand-cream py-20 md:py-32 text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h1 className="text-3xl md:text-5xl font-light tracking-[0.2em] uppercase mb-6">
                        Returns & Exchanges
                    </h1>
                    <p className="text-sm text-gray-600 tracking-wide">
                        We want you to love your purchase
                    </p>
                </div>
            </section>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                {/* Return Policy */}
                <section className="mb-16">
                    <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-6 pb-4 border-b border-brand-primary">
                        Return Policy
                    </h2>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            We accept returns within <strong>30 days</strong> of delivery for a full refund. Items must be:
                        </p>
                        <ul className="text-sm text-gray-600 leading-relaxed space-y-2 ml-4">
                            <li>• Unworn and unwashed</li>
                            <li>• In original condition with all tags attached</li>
                            <li>• In original packaging (if applicable)</li>
                        </ul>
                    </div>
                </section>

                {/* Non-Returnable Items */}
                <section className="mb-16">
                    <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-6 pb-4 border-b border-brand-primary">
                        Non-Returnable Items
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        The following items cannot be returned:
                    </p>
                    <ul className="text-sm text-gray-600 leading-relaxed space-y-2 ml-4">
                        <li>• Final sale items (marked as "Final Sale")</li>
                        <li>• Intimates and swimwear</li>
                        <li>• Items that have been worn, washed, or altered</li>
                        <li>• Gift cards</li>
                    </ul>
                </section>

                {/* How to Return */}
                <section className="mb-16">
                    <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-6 pb-4 border-b border-brand-primary">
                        How to Initiate a Return
                    </h2>
                    <ol className="space-y-6">
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-brand-cream flex items-center justify-center text-sm font-medium">1</span>
                            <div>
                                <h3 className="text-sm font-medium mb-1">Contact Us</h3>
                                <p className="text-sm text-gray-600">
                                    Email us at hello@sankofa.com with your order number and reason for return.
                                </p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-brand-cream flex items-center justify-center text-sm font-medium">2</span>
                            <div>
                                <h3 className="text-sm font-medium mb-1">Receive Your Label</h3>
                                <p className="text-sm text-gray-600">
                                    We'll send you a prepaid return shipping label via email within 24-48 hours.
                                </p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-brand-cream flex items-center justify-center text-sm font-medium">3</span>
                            <div>
                                <h3 className="text-sm font-medium mb-1">Ship Your Return</h3>
                                <p className="text-sm text-gray-600">
                                    Pack your items securely and drop off at your nearest shipping location.
                                </p>
                            </div>
                        </li>
                        <li className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 bg-brand-cream flex items-center justify-center text-sm font-medium">4</span>
                            <div>
                                <h3 className="text-sm font-medium mb-1">Receive Your Refund</h3>
                                <p className="text-sm text-gray-600">
                                    Once we receive and inspect your return, we'll process your refund within 5-7 business days.
                                </p>
                            </div>
                        </li>
                    </ol>
                </section>

                {/* Exchanges */}
                <section className="mb-16">
                    <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-6 pb-4 border-b border-brand-primary">
                        Exchanges
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        Need a different size or color? We offer free exchanges within 30 days of delivery.
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Contact us with your order number and the item you'd like to exchange. We'll ship the new 
                        item as soon as we receive your return, subject to availability.
                    </p>
                </section>

                {/* Refunds */}
                <section className="mb-16">
                    <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-6 pb-4 border-b border-brand-primary">
                        Refund Information
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        Refunds will be credited to your original payment method. Please allow 3-5 business days 
                        for the refund to appear in your account after processing.
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Original shipping costs are non-refundable unless the return is due to our error 
                        (e.g., defective item, wrong item shipped).
                    </p>
                </section>

                {/* Contact */}
                <section className="p-8 bg-brand-cream text-center">
                    <h3 className="text-sm font-medium mb-4">Need help with a return?</h3>
                    <p className="text-xs text-gray-600 mb-6">
                        Our customer service team is ready to assist
                    </p>
                    <Link
                        href="/contact"
                        className="inline-block bg-brand-primary text-white px-8 py-3 text-xs uppercase tracking-wider hover:bg-neutral-700 transition-colors"
                    >
                        Contact Us
                    </Link>
                </section>
            </div>
        </div>
    )
}
