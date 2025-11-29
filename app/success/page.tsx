'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function SuccessPage() {
    const { clearCart } = useCart()
    const searchParams = useSearchParams()
    const reference = searchParams.get('reference') || searchParams.get('session_id')

    useEffect(() => {
        // Clear cart after successful payment
        if (reference) {
            clearCart()
        }
    }, [reference, clearCart])

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <div className="flex justify-center mb-6">
                <CheckCircle className="h-24 w-24 text-green-600" />
            </div>

            <h1 className="text-4xl font-bold tracking-tighter mb-4">
                Order Confirmed!
            </h1>

            <p className="text-ck-gray-600 text-lg mb-4">
                Thank you for your purchase. We&apos;ve sent a confirmation email with your order details.
            </p>

            {reference && (
                <p className="text-sm text-ck-gray-500 mb-8">
                    Reference: <span className="font-mono">{reference}</span>
                </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products">
                    <Button size="lg">Continue Shopping</Button>
                </Link>
                <Link href="/">
                    <Button size="lg" variant="secondary">Return Home</Button>
                </Link>
            </div>
        </div>
    )
}
