import { serverClient } from '@/lib/sanity-server'
import hubtelService from '@/lib/hubtel'

export type PaymentProvider = 'hubtel' | 'paystack'

export interface GatewayState {
  hubtel: { enabled: boolean; configured: boolean }
  paystack: { enabled: boolean; configured: boolean }
  default: PaymentProvider
}

const FALLBACK: GatewayState = {
  hubtel: { enabled: true, configured: false },
  paystack: { enabled: false, configured: false },
  default: 'hubtel',
}

/**
 * Read the admin-controlled gateway configuration from Sanity, merged with
 * env-var presence (which determines whether each gateway can actually run).
 *
 * Verification routes should NOT use this — they should always work, even
 * for a now-disabled provider, so customers with in-flight payments can
 * still complete.
 */
export async function getGatewayState(): Promise<GatewayState> {
  try {
    const settings = await serverClient.fetch<{
      paymentGateways?: {
        hubtelEnabled?: boolean
        paystackEnabled?: boolean
        defaultGateway?: PaymentProvider
      }
    } | null>(
      `*[_type == "siteSettings"][0] {
        paymentGateways {
          hubtelEnabled,
          paystackEnabled,
          defaultGateway
        }
      }`
    )

    const gw = settings?.paymentGateways
    const hubtelConfigured = hubtelService.isConfigured
    const paystackConfigured = !!process.env.PAYSTACK_SECRET_KEY

    // First-run defaults: if the doc has no paymentGateways yet, treat Hubtel as enabled.
    const hubtelEnabled = gw?.hubtelEnabled ?? true
    const paystackEnabled = gw?.paystackEnabled ?? false
    const defaultGateway: PaymentProvider = gw?.defaultGateway ?? 'hubtel'

    return {
      hubtel: { enabled: hubtelEnabled, configured: hubtelConfigured },
      paystack: { enabled: paystackEnabled, configured: paystackConfigured },
      default: defaultGateway,
    }
  } catch (error) {
    console.error('[payment-gateways] Failed to read gateway state:', error)
    return FALLBACK
  }
}

/**
 * Returns the provider to use for a new payment.
 *
 * No fallback: the admin's configured default is the source of truth. If
 * the default gateway is disabled or its env vars are not set, this
 * throws and the caller should surface the error to the customer. A
 * client-supplied `preferred` is honored only if that gateway is enabled
 * and configured — otherwise we use the admin default (still respecting
 * the no-fallback rule, so if the default is also unavailable we throw).
 */
export async function resolveProvider(preferred?: PaymentProvider): Promise<PaymentProvider> {
  const state = await getGatewayState()

  const isAvailable = (p: PaymentProvider) =>
    p === 'hubtel'
      ? state.hubtel.enabled && state.hubtel.configured
      : state.paystack.enabled && state.paystack.configured

  if (preferred) {
    if (isAvailable(preferred)) return preferred
    throw new Error(
      `Payment gateway "${preferred}" is not available. ` +
        (preferred === 'hubtel'
          ? state.hubtel.enabled ? 'Hubtel is enabled but not configured.' : 'Hubtel is disabled.'
          : state.paystack.enabled ? 'Paystack is enabled but not configured.' : 'Paystack is disabled.')
    )
  }

  if (isAvailable(state.default)) return state.default

  throw new Error(
    `Default payment gateway "${state.default}" is not available. ` +
      'Please check admin settings — the admin\'s selected gateway must be both enabled and configured.'
  )
}
