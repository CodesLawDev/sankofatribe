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
 * Detect user's country code from IP geolocation, timezone, or browser locale
 * Uses multiple methods for accuracy with fallback to default
 */
export async function detectUserCountry(): Promise<string> {
  try {
    // Method 1: IP-based geolocation (most accurate)
    try {
      const geoResponse = await fetch('https://ip-api.com/json/?fields=countryCode', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (geoResponse.ok) {
        const geoData = await geoResponse.json() as { countryCode?: string }
        if (geoData.countryCode) {
          console.log('Location detected via IP:', geoData.countryCode)
          return geoData.countryCode.toUpperCase()
        }
      }
    } catch (ipError) {
      console.debug('IP geolocation failed, trying alternative methods:', ipError)
    }

    // Method 2: Timezone detection (good for accuracy)
    if (typeof Intl !== 'undefined') {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (tz) {
        // Check for Ghana timezones
        if (tz.toLowerCase().includes('accra') || tz.includes('Africa/Accra')) {
          console.log('Location detected via timezone:', tz)
          return 'GH'
        }
      }
    }

    // Method 3: Browser locale (fallback)
    if (typeof navigator !== 'undefined') {
      const locales = navigator.languages && navigator.languages.length > 0 ? navigator.languages : [navigator.language]
      const locale = locales.find((loc) => loc && loc.includes('-')) || locales[0]
      const country = locale?.split('-')[1]
      if (country) {
        console.log('Location detected via browser locale:', country)
        return country.toUpperCase()
      }
    }
    
    // Fallback: default to Ghana
    console.log('Could not detect location, defaulting to GH')
    return 'GH'
  } catch (error) {
    console.error('Country detection error:', error)
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
