export interface CreatePaymentParams {
  priceAmount: number;
  priceCurrency?: string;
  payCurrency?: string;
  orderId?: string;
  orderDescription?: string;
}

export class NOWPaymentsClient {
  private baseUrl = 'https://api.nowpayments.io/v1';
  
  constructor(private apiKey: string) {}

  async createPayment({
    priceAmount,
    priceCurrency = 'USD',
    payCurrency = 'BTC,ETH,USDT',
    orderId,
    orderDescription
  }: CreatePaymentParams) {
    const response = await fetch(`${this.baseUrl}/payment`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        price_amount: priceAmount,
        price_currency: priceCurrency,
        pay_currency: payCurrency,
        order_id: orderId,
        order_description: orderDescription,
        ipn_callback_url: `${window.location.origin}/api/nowpayments-webhook`
      })
    });
    
    if (!response.ok) {
      throw new Error(`NOWPayments API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getPaymentStatus(paymentId: string) {
    const response = await fetch(`${this.baseUrl}/payment/${paymentId}`, {
      headers: {
        'x-api-key': this.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`NOWPayments API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getAvailableCurrencies() {
    const response = await fetch(`${this.baseUrl}/currencies`, {
      headers: {
        'x-api-key': this.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`NOWPayments API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getMinimumPaymentAmount(currencyFrom: string, currencyTo: string) {
    const response = await fetch(
      `${this.baseUrl}/min-amount?currency_from=${currencyFrom}&currency_to=${currencyTo}`,
      {
        headers: {
          'x-api-key': this.apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`NOWPayments API error: ${response.statusText}`);
    }

    return response.json();
  }
}
