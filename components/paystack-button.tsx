'use client'

import { Button } from './ui/button'
import { useEffect } from 'react'

interface PaystackButtonProps {
    config: {
        reference: string
        email: string
        amount: number
        publicKey: string
        metadata?: any
    }
    onSuccess: (reference: any) => void
    onClose: () => void
    disabled?: boolean
    text?: string
}

export default function PaystackButton({ 
    config, 
    onSuccess, 
    onClose, 
    disabled = false,
    text = 'Pay Now' 
}: PaystackButtonProps) {
    // Load Paystack script on mount
    useEffect(() => {
        // Check if script already loaded
        if ((window as any).PaystackPop) {
            console.log('Paystack script already loaded')
            return
        }

        const script = document.createElement('script')
        script.src = 'https://js.paystack.co/v1/inline.js'
        script.async = true
        
        script.onload = () => {
            console.log('Paystack script loaded successfully')
        }
        
        script.onerror = () => {
            console.error('Failed to load Paystack script')
        }
        
        document.head.appendChild(script)
        
        return () => {
            // Don't remove the script - let it persist
        }
    }, [])

    const handleClick = async () => {
        // Small delay to ensure script is loaded
        await new Promise(resolve => setTimeout(resolve, 500))

        if (!config.publicKey) {
            alert('Payment system not configured. Please reload the page.')
            console.error('Missing public key:', config.publicKey)
            return
        }

        if (!config.email || !config.email.includes('@')) {
            alert('Please enter a valid email address before proceeding')
            return
        }
        
        if (config.amount <= 0) {
            alert('Invalid payment amount')
            return
        }

        console.log('Initializing Paystack payment with config:', {
            email: config.email,
            amount: config.amount,
            reference: config.reference,
            publicKey: config.publicKey
        })

        // Use Paystack inline directly
        const PaystackPop = (window as any).PaystackPop
        if (!PaystackPop) {
            console.error('PaystackPop not available. Script may not have loaded.')
            alert('Payment system loading... please try again')
            return
        }

        console.log('PaystackPop is available, setting up handler...')

        const handler = PaystackPop.setup({
            key: config.publicKey,
            email: config.email,
            amount: config.amount,
            ref: config.reference,
            metadata: config.metadata || {},
            onClose: function() {
                console.log('Payment window closed')
                onClose()
            },
            onSuccess: function(response: any) {
                console.log('Payment successful:', response)
                onSuccess(response)
            }
        })
        
        console.log('Opening Paystack iframe...')
        handler.openIframe()
    }

    return (
        <Button
            onClick={handleClick}
            disabled={disabled}
            className="w-full bg-black text-white hover:bg-gray-800 py-3"
        >
            {text}
        </Button>
    )
}
