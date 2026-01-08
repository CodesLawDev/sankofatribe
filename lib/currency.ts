export interface CurrencySettings {
  defaultCurrency: 'GHS' | 'USD'
  exchangeRate: number
  lastUpdated?: string
}

export interface GeoSettings {
  ghanaCurrencyCountries: string[]
  defaultCountry: string
}

/**
 * Convert GHS to USD using exchange rate
 */
export function convertGHSToUSD(amount: number, exchangeRate: number): number {
  return Math.round(amount * exchangeRate * 100) / 100
}

/**
 * Convert USD to GHS using exchange rate
 */
export function convertUSDToGHS(amount: number, exchangeRate: number): number {
  return Math.round((amount / exchangeRate) * 100) / 100
}

/**
 * Format price based on currency
 */
export function formatPrice(amount: number, currency: 'GHS' | 'USD'): string {
  const symbol = currency === 'GHS' ? '₵' : '$'
  return `${symbol}${amount.toFixed(2)}`
}

/**
 * Detect user's country code from IP or browser locale
 */
export async function detectUserCountry(): Promise<string> {
  try {
    // Try to get from browser locale first
    if (typeof navigator !== 'undefined' && navigator.language) {
      const locale = navigator.language.split('-')[1]
      if (locale) return locale.toUpperCase()
    }
    
    // Fallback: could integrate with IP geolocation service
    // For now, return default
    return 'GH'
  } catch {
    return 'GH'
  }
}

/**
 * Determine if user should use GHS or USD
 */
export function getUserCurrency(
  userCountry: string,
  ghanaCurrencyCountries: string[] = ['GH']
): 'GHS' | 'USD' {
  return ghanaCurrencyCountries.includes(userCountry) ? 'GHS' : 'USD'
}
