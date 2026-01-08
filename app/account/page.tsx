'use client'

import { useState } from 'react'
import { User, Package, Heart, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Breadcrumbs from '@/components/breadcrumbs'

export default function AccountPage() {
    const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'settings'>('orders')

    const tabs = [
        { id: 'orders' as const, label: 'Orders', icon: Package },
        { id: 'wishlist' as const, label: 'Wishlist', icon: Heart },
        { id: 'settings' as const, label: 'Settings', icon: Settings },
    ]

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-16">
            <Breadcrumbs items={[{ label: 'Account' }]} />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-100 p-6 rounded-lg">
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                            <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center">
                                <User className="h-8 w-8 text-brand-primary" />
                            </div>
                            <div>
                                <h2 className="text-sm font-medium">Welcome back!</h2>
                                <p className="text-xs text-neutral-600">guest@example.com</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                                            activeTab === tab.id
                                                ? 'bg-brand-primary text-white'
                                                : 'hover:bg-gray-50 text-neutral-700'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {tab.label}
                                    </button>
                                )
                            })}
                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    {activeTab === 'orders' && (
                        <div>
                            <h1 className="text-2xl font-light tracking-wider uppercase mb-6">Order History</h1>
                            <div className="bg-white border border-gray-100 rounded-lg p-12 text-center">
                                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-neutral-600 mb-4">No orders yet</p>
                                <Button>Start Shopping</Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'wishlist' && (
                        <div>
                            <h1 className="text-2xl font-light tracking-wider uppercase mb-6">My Wishlist</h1>
                            <div className="bg-white border border-gray-100 rounded-lg p-12 text-center">
                                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-neutral-600 mb-4">Your wishlist is empty</p>
                                <Button>Browse Products</Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div>
                            <h1 className="text-2xl font-light tracking-wider uppercase mb-6">Account Settings</h1>
                            <form className="space-y-6 bg-white border border-gray-100 rounded-lg p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="firstName" className="block text-xs uppercase tracking-wider font-medium mb-2">
                                            First Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="lastName" className="block text-xs uppercase tracking-wider font-medium mb-2">
                                            Last Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-xs uppercase tracking-wider font-medium mb-2">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-xs uppercase tracking-wider font-medium mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>

                                <div className="pt-4">
                                    <Button type="submit">Save Changes</Button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
