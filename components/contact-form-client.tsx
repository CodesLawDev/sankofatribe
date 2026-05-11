'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MapPin, Mail, Clock } from 'lucide-react'
import { PortableText } from '@portabletext/react'
import { TextPageData } from '@/lib/content'

interface ContactFormClientProps {
    pageData: TextPageData | null
}

export default function ContactFormClient({ pageData }: ContactFormClientProps) {
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
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        console.log('Form submitted:', formData)
        setStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
            <div className="grid md:grid-cols-2 gap-16">
                <div>
                    <h2 className="text-2xl font-light tracking-wider uppercase mb-8 text-slate-900 dark:text-white">Get in Touch</h2>
                    
                    {pageData?.content && (
                        <div className="prose dark:prose-invert mb-8">
                            <PortableText value={pageData.content} />
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="flex gap-4 glass-sm p-4 rounded-lg">
                            <MapPin className="h-5 w-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-sm font-medium mb-1 text-slate-900 dark:text-white">Address</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">Accra, Ghana</p>
                            </div>
                        </div>

                        <div className="flex gap-4 glass-sm p-4 rounded-lg">
                            <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-sm font-medium mb-1 text-slate-900 dark:text-white">Email</h3>
                                <a href="mailto:sankofatribe007@gmail.com" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    sankofatribe007@gmail.com
                                </a>
                            </div>
                        </div>

                        <div className="flex gap-4 glass-sm p-4 rounded-lg">
                            <Clock className="h-5 w-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-sm font-medium mb-1 text-slate-900 dark:text-white">Business Hours</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">Mon - Fri: 9am - 5pm</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-light tracking-wider uppercase mb-8 text-slate-900 dark:text-white">Send a Message</h2>
                    
                    <form onSubmit={handleSubmit} className="glass-container space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">
                                Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 glass-sm rounded-lg border-transparent focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">
                                Email *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 glass-sm rounded-lg border-transparent focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">
                                Subject *
                            </label>
                            <select
                                id="subject"
                                name="subject"
                                required
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full px-4 py-3 glass-sm rounded-lg border-transparent focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all text-slate-900 dark:text-white"
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
                            <label htmlFor="message" className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">
                                Message *
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                required
                                rows={6}
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full px-4 py-3 glass-sm rounded-lg border-transparent focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 transition-all resize-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full md:w-auto btn-glass-primary rounded-lg"
                        >
                            {status === 'loading' ? 'Sending...' : 'Send Message'}
                        </Button>

                        {status === 'success' && (
                            <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                Thank you! Your message has been sent successfully.
                            </p>
                        )}

                        {status === 'error' && (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                Sorry, there was an error sending your message. Please try again.
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}
