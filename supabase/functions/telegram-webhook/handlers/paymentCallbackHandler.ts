
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../services/loggingService.ts';

/**
 * Handles Telegram payment callbacks
 * @param supabase Supabase client
 * @param payload The payment callback payload
 */
export async function handlePaymentCallback(
  supabase: ReturnType<typeof createClient>,
  payload: any
) {
  const logger = createLogger(supabase, 'PAYMENT-CALLBACK');
  
  try {
    await logger.info(`Processing payment callback: ${JSON.stringify(payload).substring(0, 200)}...`);
    
    // Extract payment information
    const {
      telegram_payment_charge_id,
      provider_payment_charge_id,
      telegram_user_id,
      invoice_payload
    } = payload;
    
    if (!telegram_payment_charge_id || !provider_payment_charge_id || !telegram_user_id) {
      await logger.error('Missing required payment data');
      return false;
    }
    
    // Parse the invoice payload
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(invoice_payload);
    } catch (err) {
      await logger.error(`Invalid invoice payload: ${invoice_payload}`);
      return false;
    }
    
    const { community_id, subscription_plan_id } = parsedPayload;
    
    if (!community_id || !subscription_plan_id) {
      await logger.error(`Missing community_id or subscription_plan_id in payload: ${invoice_payload}`);
      return false;
    }
    
    // Get subscription plan details
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', subscription_plan_id)
      .single();
      
    if (planError || !planData) {
      await logger.error(`Failed to fetch subscription plan: ${planError?.message}`);
      return false;
    }
    
    const amount = payload.total_amount / 100; // Convert from cents to dollars/etc
    
    // Record the payment
    const { data: payment, error: paymentError } = await supabase
      .from('subscription_payments')
      .insert({
        telegram_user_id: telegram_user_id.toString(),
        community_id,
        subscription_plan_id,
        payment_provider: 'telegram',
        payment_amount: amount,
        currency: payload.currency,
        payment_status: 'completed',
        payment_provider_id: provider_payment_charge_id,
        telegram_payment_id: telegram_payment_charge_id,
        invoice_data: payload
      })
      .select()
      .single();
      
    if (paymentError) {
      await logger.error(`Failed to record payment: ${paymentError.message}`);
      return false;
    }
    
    await logger.success(`Payment recorded successfully: ${payment.id}`);
    
    // Calculate subscription end date based on the plan
    const currentDate = new Date();
    let endDate = new Date(currentDate);
    
    if (planData.duration_unit === 'days') {
      endDate.setDate(endDate.getDate() + planData.duration_value);
    } else if (planData.duration_unit === 'months') {
      endDate.setMonth(endDate.getMonth() + planData.duration_value);
    } else if (planData.duration_unit === 'years') {
      endDate.setFullYear(endDate.getFullYear() + planData.duration_value);
    }
    
    // Update or create member record
    const { data: existingMember } = await supabase
      .from('telegram_chat_members')
      .select('id')
      .eq('telegram_user_id', telegram_user_id.toString())
      .eq('community_id', community_id)
      .single();
      
    if (existingMember) {
      // Update existing member
      const { error: updateError } = await supabase
        .from('telegram_chat_members')
        .update({
          subscription_status: 'active',
          subscription_end_date: endDate.toISOString(),
          subscription_plan_id: subscription_plan_id,
          is_active: true
        })
        .eq('id', existingMember.id);
        
      if (updateError) {
        await logger.error(`Failed to update member record: ${updateError.message}`);
        return false;
      }
    } else {
      // Create new member record
      const { error: insertError } = await supabase
        .from('telegram_chat_members')
        .insert({
          telegram_user_id: telegram_user_id.toString(),
          community_id,
          subscription_status: 'active',
          subscription_end_date: endDate.toISOString(),
          subscription_plan_id,
          is_active: true
        });
        
      if (insertError) {
        await logger.error(`Failed to create member record: ${insertError.message}`);
        return false;
      }
    }
    
    await logger.success('Member subscription updated successfully');
    
    // Log to activity log
    await supabase
      .from('subscription_activity_logs')
      .insert({
        telegram_user_id: telegram_user_id.toString(),
        community_id,
        activity_type: 'payment_received',
        details: `Payment of ${amount} ${payload.currency} received for subscription plan ${planData.name}`
      });
      
    return true;
  } catch (error) {
    await logger.error(`Exception in handlePaymentCallback: ${error.message}`);
    return false;
  }
}
