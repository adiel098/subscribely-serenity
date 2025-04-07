
interface CreatePaymentParams {
  priceAmount: number;
  priceCurrency: string;
  orderId?: string;
  orderDescription?: string;
  ipnCallbackUrl?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface NOWPaymentsResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  payment_url: string;
  price_amount: number;
  price_currency: string;
  order_id?: string;
  order_description?: string;
  created_at?: string;
  pay_amount?: number;
  pay_currency?: string;
  network?: string;
}

export class NOWPaymentsClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.nowpayments.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Creates a new payment using the NOWPayments API
   */
  async createPayment(params: CreatePaymentParams): Promise<NOWPaymentsResponse> {
    // In development or without API key, return mock data
    if (process.env.NODE_ENV === 'development' || !this.apiKey) {
      console.log('NOWPayments: Running in dev mode or missing API key, returning mock payment');
      
      // For testing, create a mock payment URL that actually works - we'll use a sample payment gateway
      const testPaymentUrl = `https://nowpayments.io/payment?amount=${params.priceAmount}&currency=${params.priceCurrency}`;
      
      // Mock data that mimics the NOWPayments API response
      return {
        payment_id: 'mock-payment-' + Math.random().toString(36).substring(2, 10),
        payment_status: 'waiting',
        pay_address: '0x1234567890abcdef',
        payment_url: testPaymentUrl,
        price_amount: params.priceAmount,
        price_currency: params.priceCurrency,
        order_id: params.orderId,
        order_description: params.orderDescription,
        created_at: new Date().toISOString(),
        pay_amount: params.priceAmount,
        pay_currency: 'BTC',
        network: 'bitcoin'
      };
    }

    // In production, make actual API call
    try {
      console.log('Making API request to NOWPayments');
      
      const response = await fetch(`${this.baseUrl}/payment`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          price_amount: params.priceAmount,
          price_currency: params.priceCurrency,
          order_id: params.orderId,
          order_description: params.orderDescription,
          ipn_callback_url: params.ipnCallbackUrl,
          success_url: params.successUrl || window.location.origin + '/payment-success',
          cancel_url: params.cancelUrl || window.location.origin + '/payment-cancel'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('NOWPayments API error response:', errorData);
        throw new Error(errorData.message || `Failed to create payment: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('NOWPayments API response:', data);
      return data;
    } catch (error) {
      console.error('NOWPayments API error:', error);
      throw error;
    }
  }

  /**
   * Gets the status of a payment
   */
  async getPaymentStatus(paymentId: string): Promise<NOWPaymentsResponse> {
    if (!this.apiKey) {
      throw new Error('API key is not configured');
    }

    // In development, return mock data
    if (process.env.NODE_ENV === 'development') {
      return {
        payment_id: paymentId,
        payment_status: Math.random() > 0.5 ? 'finished' : 'waiting',
        pay_address: '0x1234567890abcdef',
        payment_url: 'https://nowpayments.io/payment/' + paymentId,
        price_amount: 50,
        price_currency: 'USD',
        created_at: new Date().toISOString(),
        pay_amount: 0.005,
        pay_currency: 'BTC',
        network: 'bitcoin'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/payment/${paymentId}`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get payment status');
      }

      return await response.json();
    } catch (error) {
      console.error('NOWPayments API error:', error);
      throw error;
    }
  }
}
