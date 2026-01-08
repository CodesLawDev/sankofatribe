'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'

export default function AdminSettings() {
    const [settings, setSettings] = useState({
        storeName: 'SANKOFA TRIBE',
        storeEmail: 'contact@sankofatribe.com',
        storePhone: '+233 123 456 789',
        currency: 'GHS',
        taxRate: 0,
        shippingFee: 0,
        maintenanceMode: false,
    })

    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // Save settings to API
            await new Promise((resolve) => setTimeout(resolve, 1000))
            console.log('Settings saved:', settings)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-darkbg">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                </div>

                {/* Settings Form */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 p-6 space-y-6">
                    {/* Store Information */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Store Information
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Store Name
                                </label>
                                <input
                                    type="text"
                                    value={settings.storeName}
                                    onChange={(e) =>
                                        setSettings({ ...settings, storeName: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Store Email
                                </label>
                                <input
                                    type="email"
                                    value={settings.storeEmail}
                                    onChange={(e) =>
                                        setSettings({ ...settings, storeEmail: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Store Phone
                                </label>
                                <input
                                    type="tel"
                                    value={settings.storePhone}
                                    onChange={(e) =>
                                        setSettings({ ...settings, storePhone: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Business Settings */}
                    <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Business Settings
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Currency
                                    </label>
                                    <select
                                        value={settings.currency}
                                        onChange={(e) =>
                                            setSettings({ ...settings, currency: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    >
                                        <option value="GHS">GHS (₵)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tax Rate (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={settings.taxRate}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                taxRate: parseFloat(e.target.value),
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Shipping Fee ({settings.currency})
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={settings.shippingFee}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            shippingFee: parseFloat(e.target.value),
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Maintenance Mode */}
                    <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            Maintenance
                        </h2>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="maintenance"
                                checked={settings.maintenanceMode}
                                onChange={(e) =>
                                    setSettings({
                                        ...settings,
                                        maintenanceMode: e.target.checked,
                                    })
                                }
                                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black dark:bg-gray-800 dark:border-gray-600"
                            />
                            <label htmlFor="maintenance" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Enable maintenance mode (disables store access)
                            </label>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 font-medium"
                        >
                            <Save className="w-5 h-5" />
                            {isSaving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
