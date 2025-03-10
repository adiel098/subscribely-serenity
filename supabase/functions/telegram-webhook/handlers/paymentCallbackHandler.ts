
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../services/loggingService.ts';

/**
 * Handles payment callbacks from Telegram
 * @param supabase Supabase client
 * @param update The payment data from Telegram
 */
export async function handlePaymentCallback(
  supabase: ReturnType<typeof createClient>,
  update: any
) {
  const logger = createLogger(supabase, 'PAYMENT-CALLBACK-HANDLER');
  
  try {
    await logger.info(`Processing payment callback: ${JSON.stringify(update).substring(0, 200)}...`);
    
    if (!update.pre_checkout_query && !update.successful_payment) {
      await logger.warn('Received payment callback without pre_checkout_query or successful_payment');
      return false;
    }
    
    // Handle pre checkout query
    if (update.pre_checkout_query) {
      await handlePreCheckoutQuery(supabase, update.pre_checkout_query);
      return true;
    }
    
    // Handle successful payment
    if (update.message?.successful_payment) {
      await handleSuccessfulPayment(supabase, update.message);
      return true;
    }
    
    return false;
  } catch (error) {
    await logger.error(`Error processing payment callback: ${error.message}`);
    return false;
  }
}

async function handlePreCheckoutQuery(supabase: ReturnType<typeof createClient>, query: any) {
  const logger = createLogger(supabase, 'PRE-CHECKOUT-HANDLER');
  
  try {
    await logger.info(`Processing pre-checkout query from user ${query.from.id} with payload: ${query.invoice_payload}`);
    
    // Parse the payload
    let payload;
    try {
      payload = JSON.parse(query.invoice_payload);
    } catch (e) {
      payload = { communityId: query.invoice_payload };
    }
    
    // Log the pre-checkout query
    await supabase
      .from('telegram_activity_logs')
      .insert({
        telegram_user_id: query.from.id.toString(),
        activity_type: 'pre_checkout_query',
        details: `Pre-checkout query for ${query.total_amount / 100} ${query.currency}`,
        metadata: payload
      });
    
    // Here you would implement any additional validation before approving the payment
    // For now, we'll just log it and let it proceed
    
    // Answer the pre-checkout query to approve it
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
    await fetch(`https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pre_checkout_query_id: query.id,
        ok: true
      })
    });
    
    await logger.success('Pre-checkout query approved');
  } catch (error) {
    await logger.error(`Error handling pre-checkout query: ${error.message}`);
    
    // Try to reject the payment if possible
    try {
      const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
      await fetch(`https://api.telegram.org/bot${botToken}/answerPreCheckoutQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pre_checkout_query_id: query.id,
          ok: false,
          error_message: "Sorry, there was an error processing your payment."
        })
      });
    } catch (e) {
      await logger.error(`Failed to reject payment: ${e.message}`);
    }
  }
}

async function handleSuccessfulPayment(supabase: ReturnType<typeof createClient>, message: any) {
  const logger = createLogger(supabase, 'PAYMENT-SUCCESS-HANDLER');
  
  try {
    const payment = message.successful_payment;
    await logger.info(`Processing successful payment from user ${message.from.id} with amount ${payment.total_amount / 100} ${payment.currency}`);
    
    // Parse the payload
    let payload;
    try {
      payload = JSON.parse(payment.invoice_payload);
    } catch (e) {
      payload = { communityId: payment.invoice_payload };
    }
    
    // Log the successful payment
    await supabase
      .from('telegram_activity_logs')
      .insert({
        telegram_user_id: message.from.id.toString(),
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
    
    // Record the payment in the database
    const { error: paymentError } = await supabase
      .from('subscription_payments')
      .insert({
        telegram_user_id: message.from.id.toString(),
        telegram_payment_id: payment.telegram_payment_charge_id,
        amount: payment.total_amount / 100,
        payment_method: 'telegram',
        status: 'completed',
        community_id: payload.communityId,
        plan_id: payload.planId,
        telegram_username: message.from.username || null,
        first_name: message.from.first_name || null,
        last_name: message.from.last_name || null
      });
    
    if (paymentError) {
      await logger.error(`Error recording payment in database: ${paymentError.message}`);
    } else {
      await logger.success('Payment recorded successfully');
    }
    
    // Check if the user is already a member, and if not, add them
    const { data: existingMember } = await supabase
      .from('telegram_chat_members')
      .select('*')
      .eq('telegram_user_id', message.from.id.toString())
      .eq('community_id', payload.communityId)
      .single();
    
    if (existingMember) {
      // Update existing member
      await supabase
        .from('telegram_chat_members')
        .update({
          subscription_status: 'active',
          is_active: true,
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: payload.endDate || null,
          subscription_plan_id: payload.planId
        })
        .eq('id', existingMember.id);
      
      await logger.info(`Updated existing member ${message.from.id} in community ${payload.communityId}`);
    } else {
      // Add new member
      await supabase
        .from('telegram_chat_members')
        .insert({
          telegram_user_id: message.from.id.toString(),
          telegram_username: message.from.username || null,
          community_id: payload.communityId,
          subscription_status: 'active',
          is_active: true,
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: payload.endDate || null,
          subscription_plan_id: payload.planId
        });
      
      await logger.info(`Added new member ${message.from.id} to community ${payload.communityId}`);
    }
    
    // Send thank you message to the user
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: message.from.id,
        text: "Thank you for your payment! Your subscription has been activated. You will be added to the community channel shortly."
      })
    });
    
    await logger.success('Sent thank you message to user');
    
  } catch (error) {
    await logger.error(`Error handling successful payment: ${error.message}`);
  }
}
