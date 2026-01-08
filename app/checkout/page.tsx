'use client'

import { useState, useEffect } from 'react'
import dynamicImport from 'next/dynamic'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { paystackConfig, convertToKobo, generateReference } from '@/lib/paystack'

// Import Paystack button dynamically to avoid SSR issues
const PaystackButton = dynamicImport(() => import('@/components/paystack-button'), { 
    ssr: false,
    loading: () => <Button disabled className="w-full">Loading payment...</Button>
})

// Completely disable static generation for this page
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'
export const revalidate = 0

export default function CheckoutPage() {
    const { cart, cartTotal } = useCart()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
    })

    // Wait for client-side mount to avoid SSR hydration issues with Paystack
    useEffect(() => {
        setMounted(true)
    }, [])

    // Calculate total with shipping
    const shippingCost = cartTotal > 100 ? 0 : 10
    const finalTotal = cartTotal + shippingCost

    // Paystack configuration
    const config = {
        reference: generateReference(),
        email: formData.email,
        amount: convertToKobo(finalTotal), // Amount in kobo
        publicKey: paystackConfig.publicKey,
        metadata: {
            custom_fields: [
                {
                    display_name: 'Customer Name',
                    variable_name: 'customer_name',
                    value: `${formData.firstName} ${formData.lastName}`,
                },
                {
                    display_name: 'Shipping Address',
                    variable_name: 'shipping_address',
                    value: `${formData.address}, ${formData.city}, ${formData.postalCode}, ${formData.country}`,
                },
            ],
        },
    }

    // Early return after all hooks
    if (mounted && cart.length === 0) {
        router.push('/cart')
        return null
    }

    // Show loading state until client-side mount
    if (!mounted) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-center min-h-[50vh]">
                    <p className="text-gray-500">Loading checkout...</p>
                </div>
            </div>
        )
    }

    const handlePaystackSuccess = async (reference: any) => {
        setLoading(true)
        try {
            // Verify payment on server
            const response = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reference: reference.reference,
                    customer: formData,
                    items: cart,
                }),
            })

            if (response.ok) {
                router.push(`/success?reference=${reference.reference}`)
            } else {
                alert('Payment verification failed. Please contact support.')
                setLoading(false)
            }
        } catch (error) {
            console.error('Error verifying payment:', error)
            alert('An error occurred. Please contact support.')
            setLoading(false)
        }
    }

    const handlePaystackClose = () => {
        setLoading(false)
        alert('Payment cancelled')
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validate email
        if (!formData.email || !formData.email.includes('@')) {
            alert('Please enter a valid email address')
            return
        }

        // Validation passed - payment button will handle the rest
        setLoading(true)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold tracking-tighter mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Checkout Form */}
                <div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold tracking-tighter mb-4">Contact Information</h2>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-ck-gray-300 focus:border-ck-black focus:outline-none"
                            />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold tracking-tighter mb-4">Shipping Address</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="First Name"
                                        required
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="px-4 py-3 border border-ck-gray-300 focus:border-ck-black focus:outline-none"
                                    />
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Last Name"
                                        required
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="px-4 py-3 border border-ck-gray-300 focus:border-ck-black focus:outline-none"
                                    />
                                </div>
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Address"
                                    required
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-ck-gray-300 focus:border-ck-black focus:outline-none"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="City"
                                        required
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className="px-4 py-3 border border-ck-gray-300 focus:border-ck-black focus:outline-none"
                                    />
                                    <input
                                        type="text"
                                        name="postalCode"
                                        placeholder="Postal Code"
                                        required
                                        value={formData.postalCode}
                                        onChange={handleInputChange}
                                        className="px-4 py-3 border border-ck-gray-300 focus:border-ck-black focus:outline-none"
                                    />
                                </div>
                                <input
                                    type="text"
                                    name="country"
                                    placeholder="Country"
                                    required
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-ck-gray-300 focus:border-ck-black focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded p-4">
                            <p className="text-sm text-blue-900">
                                💳 <strong>Payment via Paystack</strong> - Secure payment processing with cards, bank transfer, and mobile money
                            </p>
                        </div>

                        {mounted && (
                            <PaystackButton
                                config={config}
                                onSuccess={handlePaystackSuccess}
                                onClose={handlePaystackClose}
                                disabled={loading || !formData.email}
                                text={loading ? 'Processing...' : 'Pay with Paystack'}
                            />
                        )}
                    </form>
                </div>

                {/* Order Summary */}
                <div>
                    <div className="bg-ck-gray-100 p-6 sticky top-24">
                        <h2 className="text-xl font-bold tracking-tighter mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            {cart.map((item) => (
                                <div key={`${item.id}-${item.selectedSize}`} className="flex justify-between text-sm">
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-gray-600">Qty: {item.quantity}</p>
                                        {item.selectedSize && <p className="text-gray-600">Size: {item.selectedSize}</p>}
                                    </div>
                                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 border-t border-gray-300 pt-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping</span>
                                <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-ck-gray-300">
                                <span>Total</span>
                                <span>${finalTotal.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-ck-gray-600 pt-2">
                                Amount will be charged in NGN (Nigerian Naira) at current exchange rate
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
