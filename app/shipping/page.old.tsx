/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link'

export const metadata = {
    title: 'Shipping & Delivery - SANKOFA',
    description: 'Learn about SANKOFA shipping options, delivery times, and policies.',
}

export default function ShippingPage() {
    return (
        <div className="bg-white text-black">
            {/* Hero Section */}
            <section className="bg-brand-cream py-20 md:py-32 text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h1 className="text-3xl md:text-5xl font-light tracking-[0.2em] uppercase mb-6">
                        Shipping & Delivery
                    </h1>
                    <p className="text-sm text-gray-600 tracking-wide">
                        Everything you need to know about getting your order
                    </p>
                </div>
            </section>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                {/* Shipping Options */}
                <section className="mb-16">
                    <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-6 pb-4 border-b border-brand-primary">
                        Shipping Options
                    </h2>
                    <div className="space-y-6">
                        <div className="grid sm:grid-cols-3 gap-4 p-6 bg-brand-cream">
                            <div>
                                <h3 className="text-sm font-medium mb-2">Standard Shipping</h3>
                                <p className="text-xs text-gray-600">5-7 Business Days</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">$10.00</p>
                                <p className="text-xs text-gray-600">Orders under $100</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-green-700">FREE</p>
                                <p className="text-xs text-gray-600">Orders over $100</p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4 p-6 bg-brand-cream">
                            <div>
                                <h3 className="text-sm font-medium mb-2">Express Shipping</h3>
                                <p className="text-xs text-gray-600">2-3 Business Days</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">$25.00</p>
                                <p className="text-xs text-gray-600">All orders</p>
                            </div>
                            <div></div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4 p-6 bg-brand-cream">
                            <div>
                                <h3 className="text-sm font-medium mb-2">International</h3>
                                <p className="text-xs text-gray-600">10-14 Business Days</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Starting at $35.00</p>
                                <p className="text-xs text-gray-600">Varies by destination</p>
                            </div>
                            <div></div>
                        </div>
                    </div>
                </section>

                {/* Processing Time */}
                <section className="mb-16">
                    <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-6 pb-4 border-b border-brand-primary">
                        Processing Time
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        Orders are typically processed within 1-2 business days. During peak seasons or promotional 
                        periods, processing may take up to 3 business days.
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        You will receive a confirmation email with tracking information once your order has shipped.
                    </p>
                </section>

                {/* Tracking */}
                <section className="mb-16">
                    <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-6 pb-4 border-b border-brand-primary">
                        Order Tracking
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Once your order ships, you'll receive an email with a tracking number and link to monitor 
                        your package. You can also track your order by logging into your account on our website.
                    </p>
                </section>

                {/* International */}
                <section className="mb-16">
                    <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-6 pb-4 border-b border-brand-primary">
                        International Shipping
                    </h2>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        We ship to most countries worldwide. International shipping rates are calculated at checkout 
                        based on your location and the weight of your order.
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Please note that international orders may be subject to customs duties and taxes, which are 
                        the responsibility of the recipient.
                    </p>
                </section>

                {/* Contact */}
                <section className="p-8 bg-brand-cream text-center">
                    <h3 className="text-sm font-medium mb-4">Have questions about shipping?</h3>
                    <p className="text-xs text-gray-600 mb-6">
                        Our customer service team is here to help
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
