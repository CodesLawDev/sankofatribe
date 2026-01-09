/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, CheckCircle } from 'lucide-react'

interface LoginFormData {
    email: string
    password: string
    rememberMe: boolean
}

export default function CustomerLoginPage() {
    const router = useRouter()
    const [isHydrated, setIsHydrated] = useState(false)
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
        rememberMe: false,
    })
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        setIsHydrated(true)
        // Load saved email if remember me was checked
        const saved = localStorage.getItem('customer-remember')
        if (saved) {
            try {
                const { email } = JSON.parse(saved)
                setFormData((prev) => ({ ...prev, email }))
            } catch {
                // Ignore parse errors
            }
        }
    }, [])

    useEffect(() => {
        if (!isHydrated) return

        // Check if already logged in
        const checkSession = async () => {
            try {
                const response = await fetch('/api/auth/me')
                if (response.ok) {
                    const data = await response.json()
                    // If customer/non-admin, redirect to account
                    if (data.user.role !== 'ADMIN') {
                        router.push('/account')
                    }
                }
            } catch (error) {
                // Not logged in
            }
        }

        checkSession()
    }, [router, isHydrated])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.currentTarget
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
        if (error) setError(null)
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        // Validation
        if (!formData.email.trim()) {
            setError('Email is required')
            setIsLoading(false)
            return
        }

        if (!formData.password) {
            setError('Password is required')
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch('/api/customer/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Login failed')
                setIsLoading(false)
                return
            }

            // Store email if remember me is checked
            if (formData.rememberMe) {
                localStorage.setItem('customer-remember', JSON.stringify({
                    email: formData.email,
                }))
            } else {
                localStorage.removeItem('customer-remember')
            }

            setSuccess(true)
            // Redirect to account/dashboard
            setTimeout(() => {
                router.push('/account')
            }, 500)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            setIsLoading(false)
        }
    }

    if (!isHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-gray-600 dark:text-gray-400">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        SANKOFA TRIBE
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Customer Account</p>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-green-700 dark:text-green-300">Login successful! Redirecting...</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
                                placeholder="your@email.com"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
                                placeholder="Enter your password"
                            />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black dark:bg-gray-700 dark:border-gray-600"
                                />
                                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                    Remember me
                                </label>
                            </div>
                            <Link href="/forgot-password" className="text-sm text-black dark:text-white hover:underline">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2 px-4 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-900 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 text-center space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-black dark:text-white font-medium hover:underline">
                                Sign up
                            </Link>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Admin?{' '}
                            <Link href="/admin/login" className="text-black dark:text-white font-medium hover:underline">
                                Admin login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}


