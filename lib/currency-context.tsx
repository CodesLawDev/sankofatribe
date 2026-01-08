'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { detectUserCountry, getUserCurrency, convertGHSToUSD, formatPrice } from '@/lib/currency'

interface CurrencyContextType {
  currency: 'GHS' | 'USD'
  exchangeRate: number
  userCountry: string
  convertPrice: (priceGHS: number) => number
  formatPrice: (price: number) => string
  isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<'GHS' | 'USD'>('GHS')
  const [exchangeRate, setExchangeRate] = useState(0.082)
  const [userCountry, setUserCountry] = useState('GH')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initCurrency = async () => {
      try {
        // Detect user country
        const country = await detectUserCountry()
        setUserCountry(country)

        // Fetch exchange rate from settings
        const response = await fetch('/api/admin/settings')
        if (response.ok) {
          const settings = await response.json()
          setExchangeRate(settings.currency?.exchangeRate || 0.082)
        }

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

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        exchangeRate,
        userCountry,
        convertPrice,
        formatPrice: formatPriceStr,
        isLoading,
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
