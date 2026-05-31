'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { detectUserCountry, getUserCurrency, convertGHSToUSD, formatPrice } from '@/lib/currency'

interface CurrencyContextType {
  currency: 'GHS' | 'USD'
  exchangeRate: number
  userCountry: string
  convertPrice: (priceGHS: number) => number
  formatPrice: (price: number) => string
  isLoading: boolean
  setCurrencyPreference: (currency: 'GHS' | 'USD') => void
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const CURRENCY_PREFERENCE_KEY = 'sankofatribe_currency_preference'

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<'GHS' | 'USD'>('GHS')
  const [exchangeRate, setExchangeRate] = useState(0.082)
  const [userCountry, setUserCountry] = useState('GH')
  const [isLoading, setIsLoading] = useState(true)
  const initializedRef = useRef(false)

  // Initialize currency on mount
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const initCurrency = async () => {
      try {
        // Always fetch exchange rate from settings first
        let rate = 0.082 // hardcoded fallback only
        try {
          const response = await fetch('/api/settings', { credentials: 'include' })
          if (response.ok) {
            const payload = await response.json()
            if (payload?.data?.currency?.exchangeRate) {
              rate = payload.data.currency.exchangeRate
              console.log('Exchange rate loaded from settings:', rate)
            }
          }
        } catch (err) {
          console.warn('Failed to fetch exchange rate from settings, using fallback:', err)
        }
        
        setExchangeRate(rate)

        // Check for saved preference first
        if (typeof window !== 'undefined') {
          const savedPreference = localStorage.getItem(CURRENCY_PREFERENCE_KEY) as 'GHS' | 'USD' | null
          if (savedPreference) {
            console.log('Using saved currency preference:', savedPreference)
            setCurrency(savedPreference)
            setIsLoading(false)
            return
          }
        }

        // No saved preference, detect user country
        const country = await detectUserCountry()
        setUserCountry(country)

        // Determine currency based on country
        const userCurr = getUserCurrency(country)
        setCurrency(userCurr)
      } catch (error) {
        console.error('Failed to initialize currency:', error)
        setCurrency('GHS')
        setExchangeRate(0.082)
      } finally {
        setIsLoading(false)
      }
    }

    initCurrency()
  }, [])

  const convertPrice = (priceGHS: number): number => {
    if (currency === 'GHS') return priceGHS
    return convertGHSToUSD(priceGHS, exchangeRate)
  }

  const formatPriceStr = (price: number): string => {
    return formatPrice(price, currency)
  }

  const setCurrencyPreference = (newCurrency: 'GHS' | 'USD') => {
    setCurrency(newCurrency)
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENCY_PREFERENCE_KEY, newCurrency)
      console.log('Currency preference saved:', newCurrency)
    }
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        exchangeRate,
        userCountry,
        convertPrice,
        formatPrice: formatPriceStr,
        isLoading,
        setCurrencyPreference,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
