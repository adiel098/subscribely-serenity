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
  payment_id?: string;
  id?: string;
  payment_status?: string;
  pay_address?: string;
  payment_url?: string;
  invoice_url?: string;
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
    console.log('NOWPaymentsClient initialized with API key present:', !!apiKey, 'API key length:', apiKey?.length || 0);
    if (!apiKey) {
      console.warn('NOWPaymentsClient initialized without API key - this will cause errors when trying to make payments!');
    }
  }

  /**
   * Creates a new payment using the NOWPayments API
   */
  async createPayment(params: CreatePaymentParams): Promise<NOWPaymentsResponse> {
    console.log('NOWPayments createPayment params:', {
      price_amount: params.priceAmount,
      price_currency: params.priceCurrency,
      order_id: params.orderId,
      order_description: params.orderDescription,
      ipn_callback_url: params.ipnCallbackUrl
    });

    if (process.env.NODE_ENV === 'development' || !this.apiKey) {
      console.log('NOWPayments: Running in dev mode or missing API key, returning mock payment');
      console.log('Payment params:', params);
      
      if (!this.apiKey) {
        console.error('NOWPayments API key is not configured. This would fail in production.');
      }
      
      const testPaymentUrl = `https://nowpayments.io/payment/?amount=${params.priceAmount}&currency=${params.priceCurrency}`;
      
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

    try {
      console.log('Making API request to NOWPayments with key:', this.apiKey ? `${this.apiKey.substring(0, 4)}...` : 'missing');
      console.log('Request params:', {
        price_amount: params.priceAmount,
        price_currency: params.priceCurrency,
        order_id: params.orderId,
        has_ipn_callback_url: !!params.ipnCallbackUrl
      });
      
      const requestBody = {
        price_amount: params.priceAmount,
        price_currency: params.priceCurrency,
        pay_currency: 'btc',
        order_id: params.orderId,
        order_description: params.orderDescription,
        ipn_callback_url: params.ipnCallbackUrl,
        success_url: params.successUrl || window.location.origin + '/payment-success',
        cancel_url: params.cancelUrl || window.location.origin + '/payment-cancel'
      };
      
      console.log('Final request body to NOWPayments:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(`${this.baseUrl}/payment`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        let errorMessage = `Failed to create payment: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error('NOWPayments API error response:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Could not parse error response as JSON:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('NOWPayments API response:', data);
      
      if (!data.payment_url) {
        console.error('NOWPayments response missing payment_url:', data);
        throw new Error('No payment URL received in response');
      }
      
      return data;
    } catch (error) {
      console.error('NOWPayments API error:', error);
      throw error;
    }
  }

  /**
   * Creates a new invoice using the NOWPayments API
   */
  async createInvoice(params: CreatePaymentParams): Promise<NOWPaymentsResponse> {
    console.log('NOWPayments createInvoice params:', params);

    if (process.env.NODE_ENV === 'development' || !this.apiKey) {
      console.log('NOWPayments: Running in dev mode or missing API key, returning mock invoice');
      
      if (!this.apiKey) {
        console.error('NOWPayments API key is not configured. This would fail in production.');
      }
      
      return {
        id: 'mock-invoice-' + Math.random().toString(36).substring(2, 10),
        invoice_url: `https://nowpayments.io/payment/?iid=mock${Date.now()}`,
        price_amount: params.priceAmount,
        price_currency: params.priceCurrency,
        order_id: params.orderId,
        order_description: params.orderDescription,
        created_at: new Date().toISOString(),
      };
    }

    try {
      console.log('Making API request to NOWPayments invoice endpoint');
      
      const requestBody = {
        price_amount: params.priceAmount,
        price_currency: params.priceCurrency,
        order_id: params.orderId,
        order_description: params.orderDescription,
        ipn_callback_url: params.ipnCallbackUrl,
        success_url: params.successUrl || window.location.href,
        cancel_url: params.cancelUrl || window.location.href
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(`${this.baseUrl}/invoice`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const statusCode = response.status;
      const statusText = response.statusText;
      
      console.error(`NOWPayments API error: HTTP ${statusCode} ${statusText}`);
      
      let errorMessage = `Failed to create invoice: ${statusText} (${statusCode})`;
      let responseBody;
      
      try {
        responseBody = await response.text();
        console.error('NOWPayments API error response (raw):', responseBody);
        
        try {
          const errorData = JSON.parse(responseBody);
          console.error('NOWPayments API error response (parsed):', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Could not parse error response as JSON:', parseError);
        }
      } catch (readError) {
        console.error('Could not read error response body:', readError);
      }
      
      if (!response.ok) {
        throw new Error(`${errorMessage} (Status: ${statusCode})`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('NOWPayments API returned non-JSON response:', text);
        throw new Error(`Invalid response format: ${contentType || 'unknown'}`);
      }
      
      const data = await response.json();
      console.log('NOWPayments invoice API response:', data);
      
      if (!data.invoice_url) {
        console.error('NOWPayments response missing invoice_url:', data);
        throw new Error('No invoice URL received in response');
      }
      
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
      console.error('API key is not configured for NOWPayments client');
      throw new Error('API key is not configured');
    }

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
        let errorMessage = 'Failed to get payment status';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Could not parse error response as JSON:', e);
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('NOWPayments API error:', error);
      throw error;
    }
  }
}
