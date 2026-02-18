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
    CheckoutId: string
    SalesInvoiceId: string
    ClientReference: string
    Status: string
    Amount: number
    CustomerPhoneNumber: string
    PaymentDetails: {
      MobileMoneyNumber: string
      PaymentType: string
      Channel: string
    }
    Description: string
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
  // Uses the RMSC endpoint (no IP whitelisting required).
  // Official docs endpoint (api-txnstatus.hubtel.com) requires IP whitelisting.
  //
  // RMSC Response shape (verified 2026-02-18):
  // {
  //   "ResponseCode": "0000",
  //   "Data": [                          ← NOTE: Array, not object
  //     {
  //       "StartDate": "2026-02-18T09:00:51.197315",
  //       "InvoiceStatus": "Success",
  //       "TransactionStatus": "Success",
  //       "TransactionId": "bd1538b6d0804d62a6527c45fafde924",
  //       "NetworkTransactionId": "75497247252",
  //       "CheckoutId": "bd1538b6d0804d62a6527c45fafde924",
  //       "TransactionType": "RECEIVE-MONEY",
  //       "PaymentMethod": "MOBILE-MONEY",
  //       "ClientReference": "cmlrsxfwe00099mbgq4984m36",
  //       "CurrencyCode": "GHS",
  //       "TransactionAmount": 0.11,
  //       "Fee": 0,
  //       "AmountAfterFees": 0.1,
  //       "MobileNumber": "233557382057",
  //       "ProviderResponseCode": "SUCCESSFUL",
  //       "ProviderDescription": "The MTN Mobile Money payment has been approved..."
  //     }
  //   ]
  // }

  async checkStatus(clientReference: string): Promise<HubtelVerificationResult> {
    if (!this.isConfigured) {
      throw new Error('Hubtel is not configured.')
    }

    // Hubtel RMSC transaction status endpoint (no IP whitelisting required)
    const url = `https://rmsc.hubtel.com/v1/merchantaccount/merchants/${this.merchantAccountNumber}/transactions/status?clientReference=${encodeURIComponent(clientReference)}`

    const response = await axios.get(url, { headers: this.headers })
    const d = response.data

    // RMSC returns Data as an ARRAY of transactions — take the first entry
    const rawData = d?.data || d?.Data
    const data = Array.isArray(rawData) ? rawData[0] : rawData || {}

    const responseCode = d?.responseCode || d?.ResponseCode || ''
    const statusFromData =
      data?.TransactionStatus || data?.transactionStatus ||
      data?.InvoiceStatus || data?.invoiceStatus ||
      data?.status || data?.Status || ''

    const isPaid =
      responseCode === '0000' &&
      (statusFromData === 'Success' || statusFromData === 'Paid')

    return {
      success: isPaid,
      status: statusFromData || 'Unknown',
      amount: data?.TransactionAmount || data?.transactionAmount || data?.Amount || data?.amount || 0,
      clientReference: clientReference,
      transactionId: data?.TransactionId || data?.transactionId || '',
      paymentMethod: data?.PaymentMethod || data?.paymentMethod || 'momo',
      customerPhone: data?.MobileNumber || data?.mobileNumber || data?.CustomerPhoneNumber || data?.customerPhoneNumber || '',
    }
  }

  // ---- Validate Webhook Callback --------------------------------------------

  // Callback POST payload (per Hubtel docs):
  // {
  //   "ResponseCode": "0000",
  //   "Status": "Success",
  //   "Data": {                           ← NOTE: Object, not array
  //     "CheckoutId": "59e2fbbff4e443b98e09346881ac7e9a",
  //     "SalesInvoiceId": "e96ccfb4746045bba13f425bd573a31c",
  //     "ClientReference": "Kaks545253",
  //     "Status": "Success",
  //     "Amount": 0.5,
  //     "CustomerPhoneNumber": "233242825109",
  //     "PaymentDetails": {
  //       "MobileMoneyNumber": "233242825109",
  //       "PaymentType": "mobilemoney",
  //       "Channel": "mtn-gh"
  //     },
  //     "Description": "The MTN Mobile Money payment has been approved..."
  //   }
  // }

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

    // Callback uses Data.Status = "Success" (not TransactionStatus per docs)
    const txStatus =
      data?.Status ||
      data?.status ||
      statusField ||
      ''

    const isPaid =
      responseCode === '0000' &&
      (txStatus === 'Success' || txStatus === 'Paid')

    return {
      success: isPaid,
      clientReference:
        data?.ClientReference || data?.clientReference || '',
      amount: data?.Amount || data?.amount || 0,
      transactionId:
        data?.SalesInvoiceId || data?.CheckoutId || data?.TransactionId || data?.transactionId || '',
      paymentMethod:
        data?.PaymentDetails?.PaymentType || data?.PaymentMethod || data?.paymentMethod || 'momo',
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
