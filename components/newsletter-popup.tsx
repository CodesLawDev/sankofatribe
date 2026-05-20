'use client'

import { useState, useEffect } from 'react'
import { X, Mail, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from './ui/button'

export default function NewsletterPopup() {
    const [isOpen, setIsOpen] = useState(false)
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        // Check if user has already seen or interacted with the popup
        const hasSeenPopup = localStorage.getItem('sankofa_newsletter_popup_seen')
        
        if (!hasSeenPopup) {
            // Wait 5 seconds before showing the popup
            const timer = setTimeout(() => {
                setIsOpen(true)
            }, 5000)
            
            return () => clearTimeout(timer)
        }
    }, [])

    const handleClose = () => {
        setIsOpen(false)
        // Record that they closed it so it doesn't bother them on every page load
        localStorage.setItem('sankofa_newsletter_popup_seen', 'true')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!email) return
        
        setStatus('loading')
        setErrorMessage('')

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email, 
                    source: 'popup' 
                })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to subscribe')
            }

            setStatus('success')
            // Don't show the popup again since they subscribed
            localStorage.setItem('sankofa_newsletter_popup_seen', 'true')

        } catch (error) {
            setStatus('error')
            setErrorMessage(error instanceof Error ? error.message : 'Something went wrong')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-lg bg-white overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 rounded-lg">
                
                {/* Close Button */}
                <button 
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 text-gray-400 hover:text-black transition-colors"
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex flex-col sm:flex-row">
                    {/* Left Side - Image/Accent (Hidden on mobile) */}
                    <div className="hidden sm:block w-2/5 bg-black p-8 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20">
                            {/* Abstract African Pattern SVG Background */}
                            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0,0 L100,100 M100,0 L0,100" stroke="white" strokeWidth="2" fill="none" />
                            </svg>
                        </div>
                        <div className="h-full flex flex-col justify-center relative z-10">
                            <h3 className="text-white font-bold text-2xl uppercase tracking-widest text-center">
                                Join<br />The<br />Tribe
                            </h3>
                        </div>
                    </div>

                    {/* Right Side - Content */}
                    <div className="w-full sm:w-3/5 p-8 flex flex-col justify-center">
                        {status === 'success' ? (
                            <div className="text-center space-y-4 py-8 animate-in fade-in slide-in-from-bottom-4">
                                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Welcome to the Tribe!</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Thank you for subscribing! As promised, here is your 10% off discount code:
                                </p>
                                <div className="bg-gray-100 py-3 px-4 rounded border border-gray-200 inline-block">
                                    <span className="font-mono font-bold text-lg text-black tracking-widest">SANKOFA007</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-4">
                                    Apply this code at checkout.
                                </p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Unlock 10% Off</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Subscribe to our newsletter to get updates on new drops, exclusive sales, and a 10% discount on your first order.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            required
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded focus:ring-black focus:border-black text-sm"
                                            disabled={status === 'loading'}
                                        />
                                    </div>

                                    {status === 'error' && (
                                        <div className="flex items-center gap-2 text-red-600 text-xs">
                                            <AlertCircle className="h-3 w-3" />
                                            {errorMessage}
                                        </div>
                                    )}

                                    <Button 
                                        type="submit" 
                                        className="w-full bg-black text-white hover:bg-gray-800 uppercase tracking-widest text-xs h-12 rounded"
                                        disabled={status === 'loading'}
                                    >
                                        {status === 'loading' ? 'Subscribing...' : 'Subscribe Now'}
                                    </Button>
                                    
                                    <p className="text-[10px] text-gray-400 text-center mt-4">
                                        By subscribing, you agree to our Terms of Service and Privacy Policy. You can unsubscribe at any time.
                                    </p>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
