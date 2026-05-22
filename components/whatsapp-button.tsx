'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

export default function WhatsappButton() {
    const [isVisible, setIsVisible] = useState(false)
    const [whatsappNumber, setWhatsappNumber] = useState<string>('')
    const message = 'Hello! I have a question about Sankofa Tribe.'

    useEffect(() => {
        // Fetch WhatsApp config from Admin settings
        fetch('/api/settings/public')
            .then(res => res.json())
            .then(data => {
                const number = data.whatsappNumber?.replace(/\D/g, '') || ''
                if (number.length >= 10) {
                    setWhatsappNumber(number)
                    // Show button after a slight delay
                    setTimeout(() => setIsVisible(true), 1000)
                }
            })
            .catch(err => console.error('Failed to fetch whatsapp config', err))
    }, [])

    if (!whatsappNumber) {
        return null
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl hover:bg-[#20bd5a] transition-colors"
                    aria-label="Chat with us on WhatsApp"
                >
                    <MessageCircle className="w-8 h-8" />
                </motion.a>
            )}
        </AnimatePresence>
    )
}
