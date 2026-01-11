'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, CheckCircle } from 'lucide-react'

interface RegisterFormData {
    firstName: string
    lastName: string
    email: string
    phone: string
    password: string
    confirmPassword: string
}

export default function RegisterPage() {
    const router = useRouter()
    const [isHydrated, setIsHydrated] = useState(false)
    const [formData, setFormData] = useState<RegisterFormData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    })
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        setIsHydrated(true)
        const checkSession = async () => {
            try {
                const response = await fetch('/api/auth/me', { cache: 'no-store' })
                if (response.ok) {
                    router.push('/account')
                }
            } catch {
                // ignore
            }
        }
        checkSession()
    }, [router])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.currentTarget
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (error) setError(null)
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            setError('First and last name are required')
            setIsLoading(false)
            return
        }

        if (!formData.email.trim()) {
            setError('Email is required')
            setIsLoading(false)
            return
        }

        if (!formData.password || !formData.confirmPassword) {
            setError('Password and confirmation are required')
            setIsLoading(false)
            return
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters')
            setIsLoading(false)
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim() || undefined,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Registration failed')
                setIsLoading(false)
                return
            }

            setSuccess(true)
            setIsLoading(false)
            setTimeout(() => {
                router.push('/account')
            }, 600)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            setIsLoading(false)
        }
    }

    if (!isHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-600">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">SANKOFA TRIBE</h1>
                    <p className="text-gray-600">Create your customer account</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-green-700">Account created! Redirecting...</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50"
                                    placeholder="Jane"
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number (optional)
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50"
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50"
                                    placeholder="At least 8 characters"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50"
                                    placeholder="Re-enter your password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2 px-4 bg-black text-white rounded-lg font-medium hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center space-y-2">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link href="/login" className="text-black font-medium hover:underline">
                                Sign in
                            </Link>
                        </p>
                        <p className="text-sm text-gray-600">
                            Admin?{' '}
                            <Link href="/admin/login" className="text-black font-medium hover:underline">
                                Admin login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
