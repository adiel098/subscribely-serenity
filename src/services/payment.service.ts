
import { supabase } from '@/integrations/supabase/client';
import { Payment, PaymentStatus } from '@/models/payment.model';
import { NOWPaymentsClient } from '@/integrations/nowpayments/client';

export class PaymentService {
  private nowPaymentsClient: NOWPaymentsClient | null = null;

  constructor() {
    this.initializeClients();
  }

  private async initializeClients() {
    // Get NOWPayments config from any active crypto payment method (not specific to any community)
    const { data: cryptoConfig } = await supabase
      .from('payment_methods')
      .select('config')
      .eq('provider', 'crypto')
      .eq('is_active', true)
      .maybeSingle();

    if (cryptoConfig?.config?.api_key) {
      this.nowPaymentsClient = new NOWPaymentsClient(cryptoConfig.config.api_key);
    }
  }

  async createPayment(params: {
    communityId: string;
    userId: string;
    amount: number;
    currency: string;
    provider: 'crypto' | 'stripe' | 'paypal';
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
    if (provider === 'crypto' && this.nowPaymentsClient) {
      try {
        const nowPayment = await this.nowPaymentsClient.createPayment({
          priceAmount: amount,
          priceCurrency: currency,
          orderId: payment.id,
          orderDescription: `Payment for community ${communityId}`
        });

        // Update payment with external ID and payment data
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
        
        return {
          ...payment,
          external_id: nowPayment.payment_id,
          metadata: {
            ...payment.metadata,
            nowpayments: nowPayment
          }
        };
      } catch (error) {
        console.error('Error creating NOWPayments payment:', error);
        throw error;
      }
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

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return data || null;
  }
  
  async checkNOWPaymentsStatus(paymentId: string): Promise<{
    status: string;
    isComplete: boolean;
    data: any;
  }> {
    try {
      // Get the payment record to find the external ID
      const payment = await this.getPayment(paymentId);
      if (!payment || !payment.external_id) {
        throw new Error('Payment not found or missing external ID');
      }
      
      // Get crypto config from any active crypto payment method
      const { data: cryptoConfig } = await supabase
        .from('payment_methods')
        .select('config')
        .eq('provider', 'crypto')
        .eq('is_active', true)
        .maybeSingle();
        
      if (!cryptoConfig?.config?.api_key) {
        throw new Error('NOWPayments API key not configured');
      }
      
      // Create client and check status
      const client = new NOWPaymentsClient(cryptoConfig.config.api_key);
      const paymentStatus = await client.getPaymentStatus(payment.external_id);
      
      // Determine if payment is complete based on NOWPayments status
      const isComplete = ['finished', 'confirmed', 'complete', 'paid'].includes(
        paymentStatus.payment_status.toLowerCase()
      );
      
      // Update local payment status if completed
      if (isComplete && payment.status !== 'completed') {
        await this.updatePaymentStatus(paymentId, 'completed');
      }
      
      return {
        status: paymentStatus.payment_status,
        isComplete,
        data: paymentStatus
      };
    } catch (error) {
      console.error('Error checking NOWPayments status:', error);
      throw error;
    }
  }
}
