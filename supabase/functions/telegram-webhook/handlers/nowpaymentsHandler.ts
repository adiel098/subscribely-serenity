
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../services/loggingService.ts';

/**
 * Handles NOWPayments IPN (Instant Payment Notification) callbacks
 * @param supabase Supabase client
 * @param requestBody The payment data from NOWPayments
 */
export async function handleNowPaymentsIPN(
  supabase: ReturnType<typeof createClient>,
  requestBody: any
) {
  const logger = createLogger(supabase, 'NOWPAYMENTS-IPN-HANDLER');
  
  try {
    await logger.info(`Processing NOWPayments IPN: ${JSON.stringify(requestBody).substring(0, 200)}...`);
    
    if (!requestBody.payment_id || !requestBody.payment_status) {
      await logger.warn('Invalid NOWPayments IPN data - missing required fields');
      return { success: false, error: 'Invalid IPN data' };
    }
    
    // Find payment by external_id (NOWPayments payment_id)
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('id, status, metadata')
      .eq('external_id', requestBody.payment_id)
      .maybeSingle();
    
    if (fetchError) {
      await logger.error(`Error fetching payment: ${fetchError.message}`);
      return { success: false, error: fetchError.message };
    }
    
    if (!payment) {
      await logger.warn(`Payment not found for external_id: ${requestBody.payment_id}`);
      return { success: false, error: 'Payment not found' };
    }
    
    await logger.info(`Found payment with ID ${payment.id}, current status: ${payment.status}`);
    
    // Determine if payment should be marked as completed
    const completedStatuses = ['finished', 'confirmed', 'complete', 'paid'];
    const failedStatuses = ['failed', 'expired', 'cancelled'];
    
    let newStatus = payment.status;
    
    if (completedStatuses.includes(requestBody.payment_status.toLowerCase())) {
      newStatus = 'completed';
    } else if (failedStatuses.includes(requestBody.payment_status.toLowerCase())) {
      newStatus = 'failed';
    }
    
    // Update payment status and metadata
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
        metadata: {
          ...payment.metadata,
          nowpayments: {
            ...payment.metadata?.nowpayments,
            payment_status: requestBody.payment_status,
            pay_address: requestBody.pay_address,
            pay_amount: requestBody.pay_amount,
            actually_paid: requestBody.actually_paid,
            pay_currency: requestBody.pay_currency,
            updated_at: new Date().toISOString()
          }
        }
      })
      .eq('id', payment.id);
      
    if (updateError) {
      await logger.error(`Error updating payment: ${updateError.message}`);
      return { success: false, error: updateError.message };
    }
    
    await logger.info(`Updated payment ${payment.id} status to ${newStatus}`);
    
    // If payment is completed, update the membership status
    if (newStatus === 'completed') {
      await logger.info(`Activating membership for completed payment ${payment.id}`);
      
      // Get the payment details with related information
      const { data: fullPayment, error: fullPaymentError } = await supabase
        .from('payments')
        .select('id, user_id, community_id, plan_id, metadata')
        .eq('id', payment.id)
        .single();
        
      if (fullPaymentError) {
        await logger.error(`Error fetching full payment data: ${fullPaymentError.message}`);
        return { success: true, message: 'Payment status updated but failed to activate membership' };
      }
      
      // Get the subscription plan details
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', fullPayment.plan_id)
        .single();
        
      if (planError) {
        await logger.error(`Error fetching plan: ${planError.message}`);
        return { success: true, message: 'Payment status updated but failed to activate membership' };
      }
      
      // Calculate subscription dates based on plan interval
      const startDate = new Date();
      const endDate = new Date();
      
      switch (plan.interval) {
        case 'monthly':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'yearly':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
        case 'quarterly':
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        default:
          // One-time payment with default 1-month access
          endDate.setMonth(endDate.getMonth() + 1);
      }
      
      // Create or update the member record
      const { error: memberError } = await supabase
        .from('community_members')
        .upsert({
          telegram_id: fullPayment.user_id,
          community_id: fullPayment.community_id,
          subscription_plan_id: fullPayment.plan_id,
          status: 'active',
          joined_at: startDate.toISOString(),
          expires_at: endDate.toISOString(),
          payment_id: fullPayment.id
        });
        
      if (memberError) {
        await logger.error(`Error creating/updating member: ${memberError.message}`);
        return { success: true, message: 'Payment status updated but failed to activate membership' };
      }
      
      await logger.info(`Successfully activated membership for payment ${payment.id}`);
    }
    
    return { success: true, message: 'IPN processed successfully' };
  } catch (error) {
    await logger.error(`Error processing NOWPayments IPN: ${error.message}`);
    return { success: false, error: error.message };
  }
}
