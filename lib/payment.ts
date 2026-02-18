import axios from 'axios'

// =============================================================================
// Paystack Payment Service — Ghana (GHS / pesewas)
// =============================================================================

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ''
const PAYSTACK_BASE_URL = 'https://api.paystack.co'

// --------------- Types -------------------------------------------------------

export type PaymentChannel = 'mobile_money' | 'card' | 'bank_transfer'

export interface InitializePaymentParams {
  email: string
  /** Amount in GHS (e.g. 150.00) — converted to pesewas internally */
  amount: number
  orderId: string
  customerName: string
  customerPhone: string
  items: Array<{ name: string; quantity: number; price: number }>
  channels?: PaymentChannel[]
  callbackUrl?: string
}

export interface PaymentResult {
  success: boolean
  authorization_url: string
  access_code: string
  reference: string
}

export interface VerificationResult {
  success: boolean
  status: string
  amount: number        // pesewas
  amountGHS: number     // GHS
  channel: string
  reference: string
  paidAt: string | null
  currency: string
  metadata: Record<string, any>
  customer: { email: string; phone?: string }
}

// --------------- Helpers -----------------------------------------------------

/** Convert GHS to pesewas (Paystack smallest unit for GHS). */
export function toPesewas(ghs: number): number {
  return Math.round(ghs * 100)
}

/** Convert pesewas back to GHS. */
export function toGHS(pesewas: number): number {
  return pesewas / 100
}

/** Generate a unique payment reference. */
export function generateReference(): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).substring(2, 10)
  return `ST-${ts}-${rand}`.toUpperCase()
}

// --------------- Service Class -----------------------------------------------

class PaystackService {
  private secretKey: string

  constructor(secretKey?: string) {
    this.secretKey = secretKey || PAYSTACK_SECRET_KEY
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    }
  }

  // ---- Initialize -----------------------------------------------------------

  async initializePayment(params: InitializePaymentParams): Promise<PaymentResult> {
    if (!this.secretKey) {
      throw new Error('Paystack secret key is not configured')
    }

    const reference = generateReference()
    const amountPesewas = toPesewas(params.amount)

    const callbackUrl =
      params.callbackUrl ||
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/verify`

    const payload = {
      email: params.email,
      amount: amountPesewas,
      currency: 'GHS',
      reference,
      callback_url: callbackUrl,
      channels: params.channels || ['mobile_money', 'card'],
      metadata: {
        orderId: params.orderId,
        customerName: params.customerName,
        customerPhone: params.customerPhone,
        items: params.items,
        custom_fields: [
          { display_name: 'Order ID', variable_name: 'order_id', value: params.orderId },
          { display_name: 'Customer', variable_name: 'customer', value: params.customerName },
        ],
      },
    }

    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      payload,
      { headers: this.headers }
    )

    if (!response.data?.status || !response.data?.data?.authorization_url) {
      throw new Error(response.data?.message || 'Failed to initialize payment with Paystack')
    }

    return {
      success: true,
      authorization_url: response.data.data.authorization_url,
      access_code: response.data.data.access_code,
      reference: response.data.data.reference,
    }
  }

  // ---- Verify ---------------------------------------------------------------

  async verifyPayment(reference: string): Promise<VerificationResult> {
    if (!this.secretKey) {
      throw new Error('Paystack secret key is not configured')
    }

    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: this.headers }
    )

    const d = response.data?.data
    if (!d) {
      throw new Error('Empty response from Paystack verification')
    }

    return {
      success: d.status === 'success',
      status: d.status,
      amount: d.amount,
      amountGHS: toGHS(d.amount),
      channel: d.channel,
      reference: d.reference,
      paidAt: d.paid_at || null,
      currency: d.currency || 'GHS',
      metadata: d.metadata || {},
      customer: {
        email: d.customer?.email || '',
        phone: d.customer?.phone,
      },
    }
  }
}

// --------------- Singleton export --------------------------------------------

const paymentService = new PaystackService()
export default paymentService
export { PaystackService }
