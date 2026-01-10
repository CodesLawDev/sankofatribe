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
  // Round to nearest whole USD as requested
  return Math.round(amount * exchangeRate)
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
    // Prefer timezone when available (helps when device language isn't region-specific)
    if (typeof Intl !== 'undefined') {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (tz && tz.toLowerCase().includes('accra')) {
        return 'GH'
      }
    }

    // Try to get from browser locale
    if (typeof navigator !== 'undefined') {
      const locales = navigator.languages && navigator.languages.length > 0 ? navigator.languages : [navigator.language]
      const locale = locales.find((loc) => loc && loc.includes('-')) || locales[0]
      const country = locale?.split('-')[1]
      if (country) return country.toUpperCase()
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
