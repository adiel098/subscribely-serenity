import { supabase } from '@/integrations/supabase/client';
import { Payment, PaymentStatus } from '@/models/payment.model';
import { NOWPaymentsClient } from '@/integrations/nowpayments/client';

export class PaymentService {
  private nowPaymentsClient: NOWPaymentsClient | null = null;

  constructor() {
    this.initializeClients();
  }

  private async initializeClients() {
    // Get NOWPayments config
    const { data: nowPaymentsConfig } = await supabase
      .from('payment_methods')
      .select('config')
      .eq('provider', 'nowpayments')
      .eq('is_active', true)
      .maybeSingle();

    if (nowPaymentsConfig?.config?.api_key) {
      this.nowPaymentsClient = new NOWPaymentsClient(nowPaymentsConfig.config.api_key);
    }
  }

  async createPayment(params: {
    communityId: string;
    userId: string;
    amount: number;
    currency: string;
    provider: 'nowpayments';
    metadata?: Record<string, any>;
  }): Promise<Payment> {
    const { communityId, userId, amount, currency, provider, metadata } = params;

    // Create payment record
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        community_id: communityId,
        user_id: userId,
        amount,
        currency,
        provider,
        status: 'pending',
        metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Initialize payment with provider
    if (provider === 'nowpayments' && this.nowPaymentsClient) {
      const nowPayment = await this.nowPaymentsClient.createPayment({
        priceAmount: amount,
        priceCurrency: currency,
        orderId: payment.id,
        orderDescription: `Payment for community ${communityId}`
      });

      // Update payment with external ID
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          external_id: nowPayment.payment_id,
          metadata: {
            ...payment.metadata,
            nowpayments: nowPayment
          }
        })
        .eq('id', payment.id);

      if (updateError) throw updateError;
    }

    return payment;
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatus) {
    const { error } = await supabase
      .from('payments')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId);

    if (error) throw error;
  }

  async getPayment(paymentId: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error) throw error;
    return data;
  }

  async getPaymentByExternalId(externalId: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('external_id', externalId)
      .single();

    if (error) throw error;
    return data;
  }
}
