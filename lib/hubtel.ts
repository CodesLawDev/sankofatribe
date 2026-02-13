import crypto from 'crypto';

const HUBTEL_API_KEY = (process.env.HUBTEL_API_KEY || '').replace(/^['"]|['"]$/g, '');
const HUBTEL_ACCOUNT_ID = (process.env.HUBTEL_ACCOUNT_ID || '').replace(/^['"]|['"]$/g, '');
const HUBTEL_MERCHANT_ACCOUNT_NUMBER = (process.env.HUBTEL_MERCHANT_ACCOUNT_NUMBER || '').replace(/^['"]|['"]$/g, '');

const HUBTEL_CHECKOUT_URL = 'https://payproxyapi.hubtel.com/items/initiate';
const HUBTEL_STATUS_CHECK_URL = 'https://rmsc.hubtel.com/v1/merchantaccount/merchants';

export type HubtelPaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'ABANDONED';

export interface HubtelInitRequest {
  amountGhs: number;
  clientReference: string;
  description: string;
  returnUrl: string;
  callbackUrl: string;
  cancellationUrl?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface HubtelInitResult {
  checkoutId: string;
  checkoutUrl: string;
  checkoutDirectUrl?: string;
  clientReference: string;
}

export interface HubtelVerifyResult {
  status: HubtelPaymentStatus;
  amountGhs: number;
  currency: string;
  channel?: string;
  channelProvider?: string;
  paidAt?: Date;
  externalId?: string;
  raw: unknown;
}

function assertHubtelConfigured(): void {
  if (!HUBTEL_API_KEY || !HUBTEL_ACCOUNT_ID || !HUBTEL_MERCHANT_ACCOUNT_NUMBER) {
    throw new Error(
      'Hubtel is not configured. Check HUBTEL_API_KEY, HUBTEL_ACCOUNT_ID, and HUBTEL_MERCHANT_ACCOUNT_NUMBER.'
    );
  }
}

function getHubtelHeaders(): HeadersInit {
  const authString = `${HUBTEL_ACCOUNT_ID}:${HUBTEL_API_KEY}`;
  const auth = Buffer.from(authString).toString('base64');

  return {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'application/json',
  };
}

export function generateHubtelReference(prefix: string = 'HUB'): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `${prefix}_${timestamp}_${random}`.toUpperCase().slice(0, 32);
}

function mapHubtelStatus(status: string): HubtelPaymentStatus {
  const normalized = (status || '').toLowerCase();

  if (['success', 'successful', 'paid', 'completed'].includes(normalized)) {
    return 'SUCCESS';
  }
  if (['failed', 'failure', 'declined', 'error', 'refunded'].includes(normalized)) {
    return 'FAILED';
  }
  if (['cancelled', 'abandoned', 'expired'].includes(normalized)) {
    return 'ABANDONED';
  }
  if (['unpaid', 'pending'].includes(normalized)) {
    return 'PENDING';
  }
  return 'PENDING';
}

export async function initHubtelCheckout(request: HubtelInitRequest): Promise<HubtelInitResult> {
  assertHubtelConfigured();

  const payload = {
    totalAmount: Number(request.amountGhs.toFixed(2)),
    description: request.description,
    callbackUrl: request.callbackUrl,
    returnUrl: request.returnUrl,
    cancellationUrl: request.cancellationUrl || request.returnUrl,
    merchantAccountNumber: HUBTEL_MERCHANT_ACCOUNT_NUMBER,
    clientReference: request.clientReference,
    ...(request.customerName ? { payeeName: request.customerName } : {}),
    ...(request.customerEmail ? { payeeEmail: request.customerEmail } : {}),
    ...(request.customerPhone ? { payeeMobileNumber: request.customerPhone } : {}),
  };

  const response = await fetch(HUBTEL_CHECKOUT_URL, {
    method: 'POST',
    headers: getHubtelHeaders(),
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  if (!responseText) {
    throw new Error(`Hubtel API returned an empty response (Status: ${response.status} ${response.statusText})`);
  }

  let result: any;
  try {
    result = JSON.parse(responseText);
  } catch (error) {
    throw new Error(`Hubtel API returned invalid response: ${response.status} ${response.statusText}`);
  }

  if (result.responseCode !== '0000' || result.status !== 'Success') {
    throw new Error(result.message || result.data?.message || 'Failed to initialize Hubtel payment');
  }

  return {
    checkoutId: result.data.checkoutId,
    checkoutUrl: result.data.checkoutUrl,
    checkoutDirectUrl: result.data.checkoutDirectUrl,
    clientReference: result.data.clientReference,
  };
}

export async function verifyHubtelPayment(clientReference: string): Promise<HubtelVerifyResult> {
  assertHubtelConfigured();

  // Hubtel transaction status check (POS Sales ID in the URL path)
  const statusUrl = `${HUBTEL_STATUS_CHECK_URL}/${HUBTEL_MERCHANT_ACCOUNT_NUMBER}/transactions/status?clientReference=${encodeURIComponent(clientReference)}`;

  const response = await fetch(statusUrl, {
    method: 'GET',
    headers: getHubtelHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Hubtel status check failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  if (result.responseCode !== '0000') {
    throw new Error(result.message || 'Failed to verify Hubtel payment');
  }

  const data = result.data || {};
  const status = mapHubtelStatus(data.status || 'pending');

  return {
    status,
    amountGhs: data.amount || 0,
    currency: data.currencyCode || 'GHS',
    channel: data.paymentMethod,
    channelProvider: data.externalTransactionId ? 'telco' : undefined,
    paidAt: data.date ? new Date(data.date) : undefined,
    externalId: data.transactionId ? String(data.transactionId) : undefined,
    raw: result,
  };
}
