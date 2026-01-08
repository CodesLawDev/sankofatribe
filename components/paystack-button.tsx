'use client'

import { usePaystackPayment } from 'react-paystack'
import { Button } from './ui/button'

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
    const initializePayment = usePaystackPayment(config)

    const handleClick = () => {
        initializePayment({ onSuccess, onClose })
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
