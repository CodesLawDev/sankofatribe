'use client'

import { useState, useEffect } from 'react'
import { useCurrency } from '@/lib/currency-context'
import { Globe } from 'lucide-react'

export default function CurrencySelector() {
  const { currency, setCurrencyPreference } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)

  if (!currency) return null

  return (
    <div className="relative">
      {/* Currency Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-xs font-medium tracking-wide hover:bg-gray-50 rounded-lg transition-colors"
        title="Change currency"
      >
        <Globe className="h-4 w-4" strokeWidth={1.5} />
        <span className="hidden sm:inline">{currency === 'GHS' ? '₵ GHS' : '$ USD'}</span>
        <span className="sm:hidden">{currency === 'GHS' ? '₵' : '$'}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <button
            onClick={() => {
              setCurrencyPreference('GHS')
              setIsOpen(false)
            }}
            className={`block w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
              currency === 'GHS'
                ? 'bg-black text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            ₵ Ghana Cedis (GHS)
          </button>
          <button
            onClick={() => {
              setCurrencyPreference('USD')
              setIsOpen(false)
            }}
            className={`block w-full text-left px-4 py-2 text-sm font-medium transition-colors border-t border-gray-100 ${
              currency === 'USD'
                ? 'bg-black text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            $ US Dollar (USD)
          </button>
        </div>
      )}
    </div>
  )
}
