'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { getTextPage, TextPageData } from '@/lib/content'
import { PortableText } from '@portabletext/react'

export default function ContactPage() {
    const [pageData, setPageData] = useState<TextPageData | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    })
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    useEffect(() => {
        async function loadData() {
            const data = await getTextPage('contact')
            setPageData(data)
        }
        loadData()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        console.log('Form submitted:', formData)
        setStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    return (
        <div className="bg-white text-black">
            {/* Hero Section */}
            <section className="bg-brand-cream py-20 md:py-32 text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h1 className="text-3xl md:text-5xl font-light tracking-[0.2em] uppercase mb-6">
                        {pageData?.title || 'Contact Us'}
                    </h1>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
                <div className="grid md:grid-cols-2 gap-16">
                    {/* Contact Information */}
                    <div>
                        <h2 className="text-2xl font-light tracking-wider uppercase mb-8">Get in Touch</h2>
                        
                        {pageData?.content && (
                            <div className="prose mb-8">
                                <PortableText value={pageData.content} />
                            </div>
                        )}

                        <div className="space-y-6">
                                <div className="flex gap-4">
                                    <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="text-sm font-medium mb-1">Address</h3>
                                        <p className="text-sm text-gray-600 whitespace-pre-line">Accra, Ghana</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Mail className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="text-sm font-medium mb-1">Email</h3>
                                        <a href="mailto:info@sankofatribe.com" className="text-sm text-gray-600 hover:text-black">
                                            info@sankofatribe.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Clock className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="text-sm font-medium mb-1">Business Hours</h3>
                                        <p className="text-sm text-gray-600 whitespace-pre-line">Mon - Fri: 9am - 5pm</p>
                                    </div>
                                </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div>
                        <h2 className="text-2xl font-light tracking-wider uppercase mb-8">Send a Message</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-2">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-brand-primary transition-colors bg-white text-black"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-brand-primary transition-colors bg-white text-black"
                                />
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                                    Subject *
                                </label>
                                <select
                                    id="subject"
                                    name="subject"
                                    required
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-brand-primary transition-colors bg-white text-black"
                                >
                                    <option value="">Select a subject</option>
                                    <option value="general">General Inquiry</option>
                                    <option value="order">Order Question</option>
                                    <option value="product">Product Question</option>
                                    <option value="returns">Returns & Exchanges</option>
                                    <option value="wholesale">Wholesale Inquiry</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium mb-2">
                                    Message *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    required
                                    rows={6}
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-brand-primary transition-colors resize-none bg-white text-black"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full md:w-auto"
                            >
                                {status === 'loading' ? 'Sending...' : 'Send Message'}
                            </Button>

                            {status === 'success' && (
                                <p className="text-sm text-green-600">
                                    Thank you! Your message has been sent successfully.
                                </p>
                            )}

                            {status === 'error' && (
                                <p className="text-sm text-red-600">
                                    Sorry, there was an error sending your message. Please try again.
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
