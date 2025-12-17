'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    })
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // In production, you would send this to your API
        console.log('Form submitted:', formData)
        setStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="bg-brand-cream py-20 md:py-32 text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h1 className="text-3xl md:text-5xl font-light tracking-[0.2em] uppercase mb-6">
                        Contact Us
                    </h1>
                    <p className="text-sm text-gray-600 tracking-wide">
                        We'd love to hear from you. Get in touch with our team.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 md:py-24">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
                    {/* Contact Form */}
                    <div>
                        <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-8">Send Us a Message</h2>
                        
                        {status === 'success' ? (
                            <div className="bg-green-50 border border-green-200 p-8 text-center">
                                <h3 className="text-sm font-medium text-green-800 mb-2">Message Sent!</h3>
                                <p className="text-xs text-green-600">
                                    Thank you for reaching out. We'll get back to you within 24-48 hours.
                                </p>
                                <Button 
                                    onClick={() => setStatus('idle')} 
                                    variant="secondary" 
                                    className="mt-6"
                                >
                                    Send Another Message
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs uppercase tracking-[0.15em] mb-2">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-brand-primary transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-[0.15em] mb-2">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-brand-primary transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-[0.15em] mb-2">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-brand-primary transition-colors bg-white"
                                    >
                                        <option value="">Select a subject</option>
                                        <option value="order">Order Inquiry</option>
                                        <option value="product">Product Question</option>
                                        <option value="returns">Returns & Exchanges</option>
                                        <option value="shipping">Shipping Information</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-[0.15em] mb-2">
                                        Message <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 text-sm focus:outline-none focus:border-brand-primary transition-colors resize-none"
                                    />
                                </div>

                                <Button 
                                    type="submit" 
                                    size="lg" 
                                    className="w-full sm:w-auto min-w-[200px]"
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? 'Sending...' : 'Send Message'}
                                </Button>
                            </form>
                        )}
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h2 className="text-xs uppercase tracking-[0.2em] font-medium mb-8">Get in Touch</h2>
                        
                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 border border-gray-200 flex items-center justify-center">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium mb-1">Visit Us</h3>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        123 Fashion Avenue<br />
                                        New York, NY 10001<br />
                                        United States
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 border border-gray-200 flex items-center justify-center">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium mb-1">Call Us</h3>
                                    <p className="text-xs text-gray-600">
                                        +1 (555) 123-4567
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 border border-gray-200 flex items-center justify-center">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium mb-1">Email Us</h3>
                                    <p className="text-xs text-gray-600">
                                        hello@sankofa.com
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 border border-gray-200 flex items-center justify-center">
                                    <Clock className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium mb-1">Business Hours</h3>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        Monday - Friday: 9am - 6pm EST<br />
                                        Saturday: 10am - 4pm EST<br />
                                        Sunday: Closed
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-12 p-6 bg-brand-cream">
                            <h3 className="text-xs uppercase tracking-[0.15em] font-medium mb-4">Customer Service</h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                For order-related inquiries, please have your order number ready. 
                                Our team typically responds within 24-48 business hours.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
