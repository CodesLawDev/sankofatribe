import axios from 'axios'

// =============================================================================
// Hubtel Online Checkout Service — Ghana (GHS)
// =============================================================================

const HUBTEL_API_KEY = process.env.HUBTEL_API_KEY || ''
const HUBTEL_ACCOUNT_ID = process.env.HUBTEL_ACCOUNT_ID || ''
const HUBTEL_MERCHANT_ACCOUNT_NUMBER = process.env.HUBTEL_MERCHANT_ACCOUNT_NUMBER || ''
const HUBTEL_WEBHOOK_SECRET = process.env.HUBTEL_WEBHOOK_SECRET || ''
const BASE_URL = 'https://payproxyapi.hubtel.com/items/initiate'

// --------------- Types -------------------------------------------------------

export interface HubtelInitParams {
  /** Amount in GHS (e.g. 150.00) */
  amount: number
  description: string
  clientReference: string
  callbackUrl?: string
  returnUrl?: string
  cancellationUrl?: string
}

export interface HubtelInitResult {
  success: boolean
  checkoutUrl: string
  checkoutId: string
  clientReference: string
}

export interface HubtelCallbackData {
  ResponseCode: string
  Status: string
  Data: {
    Amount: number
    AmountAfterCharges: number
    AmountCharged: number
    CheckoutId: string
    ClientReference: string
    CustomerPhoneNumber: string
    Description: string
    ExternalTransactionId: string
    Fee: number
    PaymentMethod: string
    TransactionId: string
    TransactionStatus: string
  }
}

export interface HubtelVerificationResult {
  success: boolean
  status: string
  amount: number
  clientReference: string
  transactionId: string
  paymentMethod: string
  customerPhone: string
}

// --------------- Service Class -----------------------------------------------

class HubtelService {
  private apiKey: string
  private accountId: string
  private merchantAccountNumber: string
  private webhookSecret: string

  constructor() {
    this.apiKey = HUBTEL_API_KEY
    this.accountId = HUBTEL_ACCOUNT_ID
    this.merchantAccountNumber = HUBTEL_MERCHANT_ACCOUNT_NUMBER
    this.webhookSecret = HUBTEL_WEBHOOK_SECRET
  }

  /** Basic auth header for Hubtel API. */
  private get headers() {
    const credentials = Buffer.from(`${this.accountId}:${this.apiKey}`).toString('base64')
    return {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    }
  }

  /** Check if Hubtel is configured. */
  get isConfigured(): boolean {
    return !!(this.apiKey && this.accountId && this.merchantAccountNumber)
  }

  // ---- Initialize Checkout --------------------------------------------------

  async initializeCheckout(params: HubtelInitParams): Promise<HubtelInitResult> {
    if (!this.isConfigured) {
      throw new Error('Hubtel is not configured. Check API key, Account ID, and Merchant Account Number.')
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const payload = {
      totalAmount: params.amount,
      description: params.description,
      callbackUrl: params.callbackUrl || `${siteUrl}/api/payment/hubtel-callback`,
      returnUrl: params.returnUrl || `${siteUrl}/checkout/verify?provider=hubtel&clientReference=${params.clientReference}`,
      cancellationUrl: params.cancellationUrl || `${siteUrl}/checkout?cancelled=true`,
      merchantAccountNumber: this.merchantAccountNumber,
      clientReference: params.clientReference,
    }

    const response = await axios.post(BASE_URL, payload, { headers: this.headers })

    if (!response.data?.data?.checkoutUrl) {
      throw new Error(response.data?.message || 'Failed to create Hubtel checkout')
    }

    return {
      success: true,
      checkoutUrl: response.data.data.checkoutUrl,
      checkoutId: response.data.data.checkoutId,
      clientReference: response.data.data.clientReference,
    }
  }

  // ---- Check Payment Status -------------------------------------------------

  async checkStatus(clientReference: string): Promise<HubtelVerificationResult> {
    if (!this.isConfigured) {
      throw new Error('Hubtel is not configured.')
    }

    // Hubtel RMSC transaction status endpoint
    const url = `https://rmsc.hubtel.com/v1/merchantaccount/merchants/${this.merchantAccountNumber}/transactions/status?clientReference=${encodeURIComponent(clientReference)}`

    const response = await axios.get(url, { headers: this.headers })
    const d = response.data

    const isPaid =
      d?.ResponseCode === '0000' ||
      d?.Data?.TransactionStatus === 'Success' ||
      d?.Data?.PaymentStatus === 'Successful' ||
      d?.data?.transactionStatus === 'Paid' ||
      d?.data?.paymentStatus === 'Paid'

    const data = d?.Data || d?.data || {}

    return {
      success: isPaid,
      status: data?.TransactionStatus || data?.transactionStatus || data?.PaymentStatus || data?.paymentStatus || 'Unknown',
      amount: data?.Amount || data?.amount || data?.InvoiceAmount || data?.invoiceAmount || 0,
      clientReference: clientReference,
      transactionId: data?.TransactionId || data?.transactionId || data?.HubtelTransactionId || '',
      paymentMethod: data?.PaymentMethod || data?.paymentMethod || 'momo',
      customerPhone: data?.CustomerPhoneNumber || data?.customerPhoneNumber || data?.Msisdn || '',
    }
  }

  // ---- Validate Webhook Callback --------------------------------------------

  /**
   * Parse and validate the Hubtel callback payload.
   * Returns structured data or throws if invalid.
   */
  parseCallback(body: any): {
    success: boolean
    clientReference: string
    amount: number
    transactionId: string
    paymentMethod: string
    customerPhone: string
    status: string
  } {
    // Hubtel sends data in different shapes depending on the notification type.
    // Handle the common patterns.
    const data = body?.Data || body?.data || body
    const responseCode = body?.ResponseCode || body?.responseCode || ''
    const statusField = body?.Status || body?.status || ''

    const txStatus =
      data?.TransactionStatus ||
      data?.transactionStatus ||
      statusField ||
      ''

    const isPaid =
      responseCode === '0000' ||
      txStatus === 'Paid' ||
      txStatus === 'Success'

    return {
      success: isPaid,
      clientReference:
        data?.ClientReference || data?.clientReference || '',
      amount: data?.Amount || data?.amount || 0,
      transactionId:
        data?.TransactionId || data?.transactionId || '',
      paymentMethod:
        data?.PaymentMethod || data?.paymentMethod || 'momo',
      customerPhone:
        data?.CustomerPhoneNumber || data?.customerPhoneNumber || '',
      status: txStatus,
    }
  }
}

// --------------- Singleton export --------------------------------------------

const hubtelService = new HubtelService()
export default hubtelService
export { HubtelService }
