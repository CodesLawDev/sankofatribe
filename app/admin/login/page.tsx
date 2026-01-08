/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState, FormEvent, ChangeEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Loader, CheckCircle } from 'lucide-react'
import { saveAdminSession, getAdminSession } from '@/lib/adminAuth'

interface FormData {
    email: string
    password: string
    rememberMe: boolean
}

interface ErrorState {
    message: string
    field?: string
}

export default function AdminLoginPage() {
    const router = useRouter()
    const [isHydrated, setIsHydrated] = useState(false)
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        rememberMe: false,
    })
    const [error, setError] = useState<ErrorState | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
    const [forgotPasswordPhone, setForgotPasswordPhone] = useState('')
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
    const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)
    const [forgotPasswordError, setForgotPasswordError] = useState('')

    useEffect(() => {
        // Mark as hydrated to prevent mismatch
        setIsHydrated(true)
    }, [])

    useEffect(() => {
        // Only check session after hydration to avoid mismatch
        if (!isHydrated) return

        const session = getAdminSession()
        if (session) {
            router.push('/admin/dashboard')
        }
    }, [router, isHydrated])

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.currentTarget
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
        // Clear error on user input
        if (error) setError(null)
    }

    const handleForgotPassword = async () => {
        setForgotPasswordError('')
        setForgotPasswordSuccess(false)

        if (!forgotPasswordEmail.trim() && !forgotPasswordPhone.trim()) {
            setForgotPasswordError('Please provide an email or phone number')
            return
        }

        setForgotPasswordLoading(true)

        try {
            const response = await fetch('/api/admin/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: forgotPasswordEmail.trim() || undefined,
                    phone: forgotPasswordPhone.trim() || undefined,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setForgotPasswordSuccess(true)
                setTimeout(() => {
                    setShowForgotPasswordModal(false)
                    setForgotPasswordEmail('')
                    setForgotPasswordPhone('')
                    setForgotPasswordSuccess(false)
                }, 3000)
            } else {
                setForgotPasswordError(data.error || 'Failed to send reset link')
            }
        } catch (err) {
            setForgotPasswordError('An error occurred. Please try again.')
        } finally {
            setForgotPasswordLoading(false)
        }
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        // Validation
        if (!formData.email.trim()) {
            setError({ message: 'Email is required', field: 'email' })
            setIsLoading(false)
            return
        }

        if (!formData.password) {
            setError({ message: 'Password is required', field: 'password' })
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch('/api/admin/auth/login', {
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
                setError({
                    message: data.error || 'Authentication failed. Please try again.',
                })
                setIsLoading(false)
                return
            }

            // Save session to localStorage
            saveAdminSession({
                user: data.user,
                token: data.token,
            })

            // Also set cookie for middleware authentication
            document.cookie = `admin-token=${data.token}; path=/; max-age=86400; SameSite=Lax`

            // Store email if remember me is checked
            if (formData.rememberMe) {
                localStorage.setItem('admin-remember', JSON.stringify({
                    email: formData.email,
                }))
            } else {
                localStorage.removeItem('admin-remember')
            }

            setSuccess(true)
            // Redirect to admin dashboard
            setTimeout(() => {
                router.push('/admin/dashboard')
            }, 500)
        } catch (err) {
            setError({
                message: err instanceof Error ? err.message : 'An error occurred. Please try again.',
            })
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-darkbg py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        SANKOFA TRIBE
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Admin Dashboard</p>
                </div>

                {/* Login Card */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-300">{error.message}</p>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-700 dark:text-green-300">Login successful! Redirecting...</p>
                    </div>
                )}

                {/* Login Form */}
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
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50"
                            placeholder="admin@example.com"
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
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50"
                            placeholder="Enter your password"
                        />
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black dark:bg-gray-800 dark:border-gray-600"
                            />
                            <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                Remember this device
                            </label>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowForgotPasswordModal(true)}
                            className="text-sm text-black dark:text-white hover:underline font-medium"
                        >
                            Forgot Password?
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading || success}
                        className="w-full bg-black dark:bg-white text-white dark:text-black font-medium py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                        {isLoading ? 'Signing in...' : success ? 'Redirecting...' : 'Sign in'}
                    </button>
                </form>

                    {/* Footer */}
                    <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        <span>Don't have admin access? </span>
                        <Link href="/" className="text-black dark:text-white hover:underline font-medium">
                            Back to Home
                        </Link>
                    </p>
                </div>

                {/* Security Note */}
                <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-500">
                    🔒 This is a secure admin portal. Only authorized personnel should log in.
                </p>
            </div>
            {/* Forgot Password Modal */}
            {showForgotPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Reset Password
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Enter your email or phone number to receive a password reset link via SMS.
                        </p>

                        {/* Error Message */}
                        {forgotPasswordError && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 dark:text-red-300">{forgotPasswordError}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {forgotPasswordSuccess && (
                            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    Password reset link sent via SMS. Check your phone!
                                </p>
                            </div>
                        )}

                        {/* Email Input */}
                        <div className="mb-4">
                            <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="forgotEmail"
                                value={forgotPasswordEmail}
                                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                disabled={forgotPasswordLoading || forgotPasswordSuccess}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50"
                                placeholder="admin@example.com"
                            />
                        </div>

                        {/* Phone Input */}
                        <div className="mb-6">
                            <label htmlFor="forgotPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Or Phone Number
                            </label>
                            <input
                                type="tel"
                                id="forgotPhone"
                                value={forgotPasswordPhone}
                                onChange={(e) => setForgotPasswordPhone(e.target.value)}
                                disabled={forgotPasswordLoading || forgotPasswordSuccess}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50"
                                placeholder="0XX XXX XXXX"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowForgotPasswordModal(false)
                                    setForgotPasswordEmail('')
                                    setForgotPasswordPhone('')
                                    setForgotPasswordError('')
                                    setForgotPasswordSuccess(false)
                                }}
                                disabled={forgotPasswordLoading}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleForgotPassword}
                                disabled={forgotPasswordLoading || forgotPasswordSuccess}
                                className="flex-1 bg-black dark:bg-white text-white dark:text-black font-medium py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {forgotPasswordLoading && <Loader className="w-4 h-4 animate-spin" />}
                                {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
