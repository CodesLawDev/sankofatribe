'use client'

import { Share2 } from 'lucide-react'
import { Event } from '@/lib/sanity'
import { useState } from 'react'

interface ShareButtonProps {
    event: Event
    slug: string
}

export default function ShareButton({ event, slug }: ShareButtonProps) {
    const [copied, setCopied] = useState(false)
    const shareUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/events/${slug}`
        : `https://sankofatribe.com/events/${slug}`
    
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: event.title,
                    text: event.summary,
                    url: shareUrl,
                })
            } catch (err) {
                console.log('Error sharing:', err)
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(shareUrl)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            } catch (err) {
                console.error('Failed to copy:', err)
            }
        }
    }
    
    return (
        <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
            <Share2 className="w-5 h-5" />
            <span>{copied ? 'Link Copied!' : 'Share Event'}</span>
        </button>
    )
}
