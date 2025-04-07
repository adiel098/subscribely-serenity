
interface CreatePaymentParams {
  priceAmount: number;
  priceCurrency: string;
  orderId?: string;
  orderDescription?: string;
  ipnCallbackUrl?: string;
}

interface PaymentResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  payment_url: string;
  price_amount: number;
  price_currency: string;
  order_id?: string;
  order_description?: string;
  created_at?: string;
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
  async createPayment(params: CreatePaymentParams): Promise<PaymentResponse> {
    // בסביבת פיתוח או ללא אמצעי גישה לשרת, נחזיר תשובה מדומה כדוגמה
    if (process.env.NODE_ENV === 'development' || !this.apiKey) {
      console.log('NOWPayments: Running in dev mode or missing API key, returning mock payment');
      
      return {
        payment_id: 'mock-payment-' + Math.random().toString(36).substring(2, 10),
        payment_status: 'waiting',
        pay_address: '0x1234567890abcdef',
        payment_url: 'https://nowpayments.io/payment/' + Math.random().toString(36).substring(2, 10),
        price_amount: params.priceAmount,
        price_currency: params.priceCurrency,
        order_id: params.orderId,
        order_description: params.orderDescription,
        created_at: new Date().toISOString()
      };
    }

    // בסביבת ייצור, נבצע קריאה אמיתית לשרת
    try {
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
          success_url: window.location.origin + '/payment-success',
          cancel_url: window.location.origin + '/payment-cancel'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment');
      }

      return await response.json();
    } catch (error) {
      console.error('NOWPayments API error:', error);
      throw error;
    }
  }

  /**
   * Gets the status of a payment
   */
  async getPaymentStatus(paymentId: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('API key is not configured');
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
