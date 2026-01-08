/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Loader } from 'lucide-react'

interface FormData {
    username: string
    password: string
    rememberMe: boolean
}

interface ErrorState {
    message: string
    field?: string
}

export default function AdminLoginPage() {
    const router = useRouter()
    const [formData, setFormData] = useState<FormData>({
        username: '',
        password: '',
        rememberMe: false,
    })
    const [error, setError] = useState<ErrorState | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.currentTarget
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
        // Clear error on user input
        if (error) setError(null)
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        // Validation
        if (!formData.username.trim()) {
            setError({ message: 'Username is required', field: 'username' })
            setIsLoading(false)
            return
        }

        if (!formData.password) {
            setError({ message: 'Password is required', field: 'password' })
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    rememberMe: formData.rememberMe,
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

            // Store user info locally if remember me is checked
            if (formData.rememberMe) {
                localStorage.setItem('admin-remember', JSON.stringify({
                    username: formData.username,
                }))
            } else {
                localStorage.removeItem('admin-remember')
            }

            // Redirect to admin dashboard
            router.push('/admin/dashboard')
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

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username Field */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50"
                                placeholder="Enter your username"
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

                        {/* Remember Me */}
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

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-black dark:bg-white text-white dark:text-black font-medium py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                            {isLoading ? 'Signing in...' : 'Sign in'}
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
        </div>
    )
}
