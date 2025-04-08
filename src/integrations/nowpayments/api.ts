interface CreateInvoiceParams {
  apiKey: string;
  price: number;
  orderId: string;
  ipnCallbackUrl: string;
  description: string;
}

export const createNowPaymentsInvoice = async ({
  apiKey,
  price,
  orderId,
  ipnCallbackUrl,
  description
}: CreateInvoiceParams) => {
  try {
    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        price_amount: price,
        price_currency: 'USD',
        order_id: orderId,
        order_description: description,
        ipn_callback_url: ipnCallbackUrl,
        success_url: window.location.origin + '/payment/success',
        cancel_url: window.location.origin + '/payment/cancel'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create invoice');
    }

    return await response.json();
  } catch (error) {
    console.error('NOWPayments API Error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to create invoice'
    };
  }
};
