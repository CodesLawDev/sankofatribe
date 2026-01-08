// Paystack configuration and utilities

export const paystackConfig = {
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
}

// Get the public key (for client-side usage)
export const getPaystackPublicKey = (): string => {
    if (typeof window !== 'undefined') {
        // Client-side: access from window or env
        return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_733efe0b808d97f06d6f52e26b84fec3bfd05901'
    }
    return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ''
}

export interface PaystackConfig {
    reference: string
    email: string
    amount: number // Amount in kobo (NGN lowest unit)
    publicKey: string
    text?: string
    onSuccess?: (reference: any) => void
    onClose?: () => void
}

// Convert dollar amount to kobo (assuming 1 USD = 1500 NGN for example)
// You should use a real exchange rate API in production
export const convertToKobo = (amountInUSD: number): number => {
    const exchangeRate = 1500 // 1 USD = 1500 NGN (update this with real rate)
    const amountInNGN = amountInUSD * exchangeRate
    return Math.round(amountInNGN * 100) // Convert to kobo
}

// Generate unique transaction reference
export const generateReference = (): string => {
    const timestamp = new Date().getTime()
    const randomStr = Math.random().toString(36).substring(2, 15)
    return `txn_${timestamp}_${randomStr}`
}
