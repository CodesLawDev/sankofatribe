import axios from 'axios';

// Paystack API configuration for Mobile Money payments
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export type PaymentChannel = 'mobile_money' | 'card' | 'bank_transfer';
export type MobileMoneyProvider = 'mtn' | 'vodafone' | 'airteltigo';

export interface PaymentInitialization {
  email: string;
  amount: number; // in pesewas (GHS * 100)
  reference?: string;
  callback_url?: string;
  channels?: PaymentChannel[];
  metadata?: {
    orderId: string;
    customerName: string;
    customerPhone: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  };
}

export interface PaymentVerification {
  reference: string;
}

export interface MobileMoneyCharge {
  email: string;
  amount: number;
  phone: string;
  provider: MobileMoneyProvider;
  reference?: string;
  metadata?: any;
}

class PaymentService {
  private secretKey: string;

  constructor(secretKey?: string) {
    this.secretKey = secretKey || PAYSTACK_SECRET_KEY;
  }

  /**
   * Convert GHS to pesewas (Paystack's smallest currency unit)
   */
  static toPesewas(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Convert pesewas to GHS
   */
  static toGHS(pesewas: number): number {
    return pesewas / 100;
  }

  /**
   * Initialize payment transaction
   */
  async initializePayment(data: PaymentInitialization) {
    try {
      if (!this.secretKey) {
        throw new Error('Paystack secret key is not configured');
      }

      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          email: data.email,
          amount: data.amount,
          reference: data.reference || this.generateReference(),
          callback_url: data.callback_url,
          channels: data.channels || ['mobile_money', 'card'],
          metadata: data.metadata,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data || response.data.status !== true) {
        throw new Error(response.data?.message || 'Paystack returned unsuccessful status')
      }

      if (!response.data?.data?.authorization_url) {
        throw new Error('No authorization URL returned from Paystack')
      }

      return {
        success: true,
        data: response.data.data,
        authorization_url: response.data.data.authorization_url,
        access_code: response.data.data.access_code,
        reference: response.data.data.reference,
      };
    } catch (error: any) {
      console.error('=== PAYSTACK ERROR ===')
      console.error('Error status:', error.response?.status)
      console.error('Error data:', JSON.stringify(error.response?.data, null, 2))
      console.error('Error message:', error.message)
      console.error('Full error:', error)
      
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.errors?.[0] ||
        error.message || 
        'Failed to initialize payment'
      );
    }
  }

  /**
   * Verify payment transaction
   */
  async verifyPayment(reference: string) {
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

      return {
        success: response.data.data.status === 'success',
        data: response.data.data,
        status: response.data.data.status,
        amount: response.data.data.amount,
        reference: response.data.data.reference,
      };
    } catch (error: any) {
      console.error('Payment verification error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Failed to verify payment');
    }
  }

  /**
   * Charge customer with Mobile Money
   */
  async chargeMobileMoney(data: MobileMoneyCharge) {
    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/charge`,
        {
          email: data.email,
          amount: data.amount,
          mobile_money: {
            phone: data.phone,
            provider: data.provider,
          },
          reference: data.reference || this.generateReference(),
          metadata: data.metadata,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data.data,
        reference: response.data.data.reference,
        status: response.data.data.status,
      };
    } catch (error: any) {
      console.error('Mobile money charge error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Failed to charge mobile money');
    }
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(reference: string) {
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('Error fetching payment details:', error.response?.data || error);
      throw new Error('Failed to fetch payment details');
    }
  }

  /**
   * Generate unique reference for payment
   */
  private generateReference(): string {
    return `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  /**
   * Create payment plan (for subscriptions)
   */
  async createPaymentPlan(planData: {
    interval: string;
    amount: number;
    plan_code?: string;
    description?: string;
  }) {
    try {
      const response = await axios.post(
        `${PAYSTACK_BASE_URL}/plan`,
        planData,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('Error creating payment plan:', error.response?.data || error);
      throw new Error('Failed to create payment plan');
    }
  }

  /**
   * List all customers
   */
  async listCustomers(options?: { perPage?: number; page?: number }) {
    try {
      const response = await axios.get(
        `${PAYSTACK_BASE_URL}/customer`,
        {
          params: options,
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }
      );

      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta,
      };
    } catch (error: any) {
      console.error('Error fetching customers:', error.response?.data || error);
      throw new Error('Failed to fetch customers');
    }
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new PaymentService();
export { PaymentService };
