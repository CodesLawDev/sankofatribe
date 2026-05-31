import { serverClient } from '@/lib/sanity-server'
import hubtelService from '@/lib/hubtel'

export type PaymentProvider = 'hubtel' | 'paystack'
export type GatewaySurface = 'productCheckout' | 'ticketing'

export interface SurfaceState {
  hubtel: { enabled: boolean; configured: boolean }
  paystack: { enabled: boolean; configured: boolean }
}

export interface GatewayState {
  productCheckout: SurfaceState
  ticketing: SurfaceState
}

interface RawSurface {
  hubtelEnabled?: boolean
  paystackEnabled?: boolean
}

const SURFACE_DEFAULTS: Record<GatewaySurface, RawSurface> = {
  productCheckout: { hubtelEnabled: true, paystackEnabled: false },
  ticketing: { hubtelEnabled: false, paystackEnabled: false },
}

function buildSurfaceState(
  raw: RawSurface | undefined,
  surface: GatewaySurface,
  hubtelConfigured: boolean,
  paystackConfigured: boolean
): SurfaceState {
  const defaults = SURFACE_DEFAULTS[surface]
  return {
    hubtel: {
      enabled: raw?.hubtelEnabled ?? defaults.hubtelEnabled!,
      configured: hubtelConfigured,
    },
    paystack: {
      enabled: raw?.paystackEnabled ?? defaults.paystackEnabled!,
      configured: paystackConfigured,
    },
  }
}

export async function getGatewayState(): Promise<GatewayState> {
  const hubtelConfigured = hubtelService.isConfigured
  const paystackConfigured = !!process.env.PAYSTACK_SECRET_KEY

  try {
    const settings = await serverClient.fetch<{
      paymentGateways?: {
        productCheckout?: RawSurface
        ticketing?: RawSurface
      }
    } | null>(
      `*[_type == "siteSettings"][0] {
        paymentGateways {
          productCheckout { hubtelEnabled, paystackEnabled },
          ticketing { hubtelEnabled, paystackEnabled }
        }
      }`
    )

    return {
      productCheckout: buildSurfaceState(
        settings?.paymentGateways?.productCheckout,
        'productCheckout',
        hubtelConfigured,
        paystackConfigured
      ),
      ticketing: buildSurfaceState(
        settings?.paymentGateways?.ticketing,
        'ticketing',
        hubtelConfigured,
        paystackConfigured
      ),
    }
  } catch (error) {
    console.error('[payment-gateways] Failed to read gateway state:', error)
    return {
      productCheckout: buildSurfaceState(undefined, 'productCheckout', hubtelConfigured, paystackConfigured),
      ticketing: buildSurfaceState(undefined, 'ticketing', hubtelConfigured, paystackConfigured),
    }
  }
}

/**
 * Resolve which provider to charge for a given surface.
 * - If `preferred` is supplied AND that gateway is enabled+configured for this surface, use it.
 * - Else if exactly one gateway is enabled+configured, use it.
 * - Else throw (none available, or both available but caller didn't pick).
 */
export async function resolveProvider(
  surface: GatewaySurface,
  preferred?: PaymentProvider
): Promise<PaymentProvider> {
  const state = await getGatewayState()
  const surfaceState = state[surface]

  const isAvailable = (p: PaymentProvider) =>
    p === 'hubtel'
      ? surfaceState.hubtel.enabled && surfaceState.hubtel.configured
      : surfaceState.paystack.enabled && surfaceState.paystack.configured

  if (preferred) {
    if (isAvailable(preferred)) return preferred
    throw new Error(
      `Payment gateway "${preferred}" is not available for ${surface}. ` +
        (preferred === 'hubtel'
          ? surfaceState.hubtel.enabled
            ? 'Hubtel is enabled but not configured.'
            : 'Hubtel is disabled for this surface.'
          : surfaceState.paystack.enabled
          ? 'Paystack is enabled but not configured.'
          : 'Paystack is disabled for this surface.')
    )
  }

  const available: PaymentProvider[] = []
  if (isAvailable('hubtel')) available.push('hubtel')
  if (isAvailable('paystack')) available.push('paystack')

  if (available.length === 1) return available[0]
  if (available.length === 0) {
    throw new Error(
      `No payment gateway is available for ${surface}. Enable at least one in admin settings.`
    )
  }
  throw new Error(
    `Multiple payment gateways are enabled for ${surface}. The caller must supply a preferred provider.`
  )
}
