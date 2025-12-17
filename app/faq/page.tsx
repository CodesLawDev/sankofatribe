'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

interface FAQItem {
    question: string
    answer: string
}

const faqCategories = [
    {
        title: 'Orders & Shipping',
        items: [
            {
                question: 'How long does shipping take?',
                answer: 'Standard shipping typically takes 5-7 business days within the US. Express shipping options are available at checkout for faster delivery (2-3 business days). International orders may take 10-14 business days depending on the destination.'
            },
            {
                question: 'Do you offer free shipping?',
                answer: 'Yes! We offer free standard shipping on all orders over $100 within the United States. For orders under $100, a flat rate shipping fee of $10 applies.'
            },
            {
                question: 'Can I track my order?',
                answer: 'Absolutely. Once your order ships, you\'ll receive an email with a tracking number and link to monitor your package\'s journey. You can also track your order by logging into your account.'
            },
            {
                question: 'Do you ship internationally?',
                answer: 'Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by location. All applicable customs duties and taxes are the responsibility of the customer.'
            }
        ]
    },
    {
        title: 'Returns & Exchanges',
        items: [
            {
                question: 'What is your return policy?',
                answer: 'We offer a 30-day return policy for all unworn items with original tags attached. Items must be in their original condition. Sale items are final sale and cannot be returned.'
            },
            {
                question: 'How do I start a return?',
                answer: 'To initiate a return, please contact our customer service team at hello@sankofa.com with your order number. We\'ll provide you with a prepaid return label and instructions.'
            },
            {
                question: 'Can I exchange an item for a different size?',
                answer: 'Yes, we offer free exchanges for different sizes within 30 days of purchase. Contact our team to arrange an exchange, and we\'ll ship the new size as soon as we receive your return.'
            },
            {
                question: 'How long do refunds take?',
                answer: 'Once we receive your return, please allow 5-7 business days for us to process it. Refunds will be credited to your original payment method within 3-5 additional business days.'
            }
        ]
    },
    {
        title: 'Products & Sizing',
        items: [
            {
                question: 'How do I find my size?',
                answer: 'Each product page includes a detailed size guide with measurements. We recommend measuring yourself and comparing to our size charts. If you\'re between sizes, we typically recommend sizing up for a more relaxed fit.'
            },
            {
                question: 'What materials do you use?',
                answer: 'We use premium, sustainable materials including organic cotton, recycled polyester, and ethically-sourced wool. Material composition is listed on each product page.'
            },
            {
                question: 'How should I care for my items?',
                answer: 'Care instructions are included on each product\'s tag and listed on the product page. Generally, we recommend cold water washing and air drying to extend the life of your garments.'
            },
            {
                question: 'Are your products sustainable?',
                answer: 'Sustainability is core to our brand. We prioritize eco-friendly materials, ethical manufacturing, and minimal packaging. We\'re continuously working to reduce our environmental footprint.'
            }
        ]
    },
    {
        title: 'Account & Payment',
        items: [
            {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Paystack, and various mobile money options. All transactions are secured with industry-standard encryption.'
            },
            {
                question: 'Is my payment information secure?',
                answer: 'Yes, we use SSL encryption and PCI-compliant payment processing to ensure your information is always protected. We never store your complete credit card details.'
            },
            {
                question: 'Do I need an account to place an order?',
                answer: 'No, you can checkout as a guest. However, creating an account allows you to track orders, save favorites, and enjoy a faster checkout experience.'
            },
            {
                question: 'How do I reset my password?',
                answer: 'Click "Forgot Password" on the login page and enter your email address. We\'ll send you a link to reset your password. For security, the link expires after 24 hours.'
            }
        ]
    }
]

function FAQAccordion({ item }: { item: FAQItem }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border-b border-gray-100">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left hover:opacity-70 transition-opacity"
            >
                <span className="text-sm font-medium pr-8">{item.question}</span>
                {isOpen ? (
                    <ChevronUp className="h-4 w-4 flex-shrink-0" />
                ) : (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                )}
            </button>
            {isOpen && (
                <div className="pb-6">
                    <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
                </div>
            )}
        </div>
    )
}

export default function FAQPage() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="bg-brand-cream py-20 md:py-32 text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h1 className="text-3xl md:text-5xl font-light tracking-[0.2em] uppercase mb-6">
                        FAQ
                    </h1>
                    <p className="text-sm text-gray-600 tracking-wide">
                        Find answers to commonly asked questions
                    </p>
                </div>
            </section>

            {/* FAQ Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                {faqCategories.map((category, index) => (
                    <div key={index} className="mb-16 last:mb-0">
                        <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-6 pb-4 border-b border-brand-primary">
                            {category.title}
                        </h2>
                        <div>
                            {category.items.map((item, itemIndex) => (
                                <FAQAccordion key={itemIndex} item={item} />
                            ))}
                        </div>
                    </div>
                ))}

                {/* Still Have Questions */}
                <div className="mt-20 text-center p-8 bg-brand-cream">
                    <h3 className="text-sm font-medium mb-4">Still have questions?</h3>
                    <p className="text-xs text-gray-600 mb-6">
                        Our customer service team is here to help
                    </p>
                    <Link
                        href="/contact"
                        className="inline-block bg-brand-primary text-white px-8 py-3 text-xs uppercase tracking-wider hover:bg-neutral-700 transition-colors"
                    >
                        Contact Us
                    </Link>
                </div>
            </div>
        </div>
    )
}
