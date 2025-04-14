import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../loggingService.ts';

/**
 * Service for recording payment information
 */
export class PaymentRecordService {
  private supabase: ReturnType<typeof createClient>;
  private logger: ReturnType<typeof createLogger>;
  
  constructor(supabase: ReturnType<typeof createClient>) {
    this.supabase = supabase;
    this.logger = createLogger(supabase, 'PAYMENT-RECORD-SERVICE');
  }
  
  /**
   * Record a payment in the database
   */
  async recordPayment(
    userId: string,
    userInfo: any,
    payment: any,
    payload: any
  ): Promise<{ paymentRecord: any; error: any }> {
    try {
      // Check if a coupon is provided in the payload
      const couponId = payload.couponId;
      let discountAmount = 0;
      let originalAmount = payment.total_amount / 100;
      
      // If a coupon is provided, retrieve it and calculate the discount
      if (couponId) {
        await this.logger.info(`Processing payment with coupon ID: ${couponId}`);
        
        try {
          const { data: coupon, error: couponError } = await this.supabase
            .from('project_coupons')
            .select('*')
            .eq('id', couponId)
            .single();
          
          if (couponError) {
            await this.logger.error(`Error retrieving coupon: ${couponError.message}`);
          } else if (coupon) {
            await this.logger.info(`Applying coupon: ${coupon.code}`);
            
            // Calculate discount
            if (coupon.discount_type === 'percentage') {
              discountAmount = (originalAmount * coupon.discount_amount) / 100;
            } else {
              discountAmount = coupon.discount_amount;
            }
            
            // Increment coupon usage count
            const { error: updateError } = await this.supabase
              .from('project_coupons')
              .update({ used_count: (coupon.used_count || 0) + 1 })
              .eq('id', couponId);
            
            if (updateError) {
              await this.logger.error(`Error updating coupon usage count: ${updateError.message}`);
            }
          }
        } catch (couponError) {
          await this.logger.error(`Error processing coupon: ${couponError.message}`);
        }
      }
      
      // Record the payment in the database
      const { data: paymentRecord, error: paymentError } = await this.supabase
        .from('subscription_payments')
        .insert({
          telegram_user_id: userId,
          telegram_payment_id: payment.telegram_payment_charge_id,
          amount: payment.total_amount / 100,
          payment_method: 'telegram',
          status: 'successful',
          community_id: payload.communityId,
          plan_id: payload.planId,
          telegram_username: userInfo.username || null,
          first_name: userInfo.first_name || null,
          last_name: userInfo.last_name || null,
          coupon_id: couponId || null,
          discount_amount: discountAmount,
          original_amount: discountAmount > 0 ? originalAmount : null
        })
        .select()
        .single();
      
      if (paymentError) {
        await this.logger.error(`Error recording payment in database: ${paymentError.message}`);
        return { paymentRecord: null, error: paymentError };
      } else {
        await this.logger.success('Payment recorded successfully');
        return { paymentRecord, error: null };
      }
    } catch (error) {
      await this.logger.error(`Error in recordPayment: ${error.message}`);
      return { paymentRecord: null, error };
    }
  }
  
  /**
   * Log payment activity
   */
  async logPaymentActivity(
    userId: string,
    payment: any,
    payload: any
  ): Promise<void> {
    try {
      await this.supabase
        .from('telegram_activity_logs')
        .insert({
          telegram_user_id: userId,
          activity_type: 'successful_payment',
          details: `Successful payment of ${payment.total_amount / 100} ${payment.currency}`,
          metadata: {
            ...payload,
            payment_id: payment.telegram_payment_charge_id,
            provider_payment_id: payment.provider_payment_charge_id,
            shipping_option_id: payment.shipping_option_id,
            order_info: payment.order_info
          }
        });
      
      await this.logger.info(`Logged payment activity for user ${userId}`);
    } catch (error) {
      await this.logger.error(`Error logging payment activity: ${error.message}`);
    }
  }
}
