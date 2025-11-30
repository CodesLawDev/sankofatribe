'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { usePaystackPayment } from 'react-paystack'
import { paystackConfig, convertToKobo, generateReference } from '@/lib/paystack'

// Disable prerendering since this page requires client-only APIs
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default function CheckoutPage() {
    const { items, totalPrice } = useCart()
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
    const shippingCost = totalPrice > 100 ? 0 : 10
    const finalTotal = totalPrice + shippingCost

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

    const initializePayment = usePaystackPayment(config)

    // Early return after all hooks
    if (items.length === 0) {
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
                    items,
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

        setLoading(true)

        // Initialize Paystack payment
        initializePayment({
            onSuccess: handlePaystackSuccess,
            onClose: handlePaystackClose,
        })
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

                        <Button type="submit" size="lg" className="w-full" disabled={loading}>
                            {loading ? 'Processing...' : 'Pay with Paystack'}
                        </Button>
                    </form>
                </div>

                {/* Order Summary */}
                <div>
                    <div className="bg-ck-gray-100 p-6 sticky top-24">
                        <h2 className="text-xl font-bold tracking-tighter mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            {items.map((item) => (
                                <div key={`${item.product._id}-${item.selectedSize}`} className="flex justify-between text-sm">
                                    <div>
                                        <p className="font-medium">{item.product.name}</p>
                                        <p className="text-ck-gray-600">Qty: {item.quantity}</p>
                                        {item.selectedSize && <p className="text-ck-gray-600">Size: {item.selectedSize}</p>}
                                    </div>
                                    <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 border-t border-ck-gray-300 pt-4">
                            <div className="flex justify-between">
                                <span className="text-ck-gray-600">Subtotal</span>
                                <span>${totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-ck-gray-600">Shipping</span>
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
