
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../services/loggingService.ts';
import { TelegramApiClient } from './utils/telegramApiClient.ts';

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
    // Get bot token from settings
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();
      
    if (settingsError || !settings?.bot_token) {
      await logger.error("Error fetching bot token: " + (settingsError?.message || "Token not found"));
      throw new Error('Bot token not found in settings');
    }
    
    const botToken = settings.bot_token;
    
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
      // Get bot token from settings
      const { data: settings } = await supabase
        .from('telegram_global_settings')
        .select('bot_token')
        .single();
        
      if (!settings?.bot_token) {
        await logger.error("Cannot reject payment - bot token not found");
        return;
      }
      
      const botToken = settings.bot_token;
      
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
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('subscription_payments')
      .insert({
        telegram_user_id: message.from.id.toString(),
        telegram_payment_id: payment.telegram_payment_charge_id,
        amount: payment.total_amount / 100,
        payment_method: 'telegram',
        status: 'successful',
        community_id: payload.communityId,
        plan_id: payload.planId,
        telegram_username: message.from.username || null,
        first_name: message.from.first_name || null,
        last_name: message.from.last_name || null
      })
      .select()
      .single();
    
    if (paymentError) {
      await logger.error(`Error recording payment in database: ${paymentError.message}`);
    } else {
      await logger.success('Payment recorded successfully');
    }
    
    // Get bot token from settings
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();
      
    if (settingsError || !settings?.bot_token) {
      await logger.error("Error fetching bot token: " + (settingsError?.message || "Token not found"));
      throw new Error('Bot token not found in settings');
    }
    
    const botToken = settings.bot_token;
    const telegramApi = new TelegramApiClient(botToken);
    
    // Check if the user is already a member, and if not, add them
    const { data: existingMember } = await supabase
      .from('telegram_chat_members')
      .select('*')
      .eq('telegram_user_id', message.from.id.toString())
      .eq('community_id', payload.communityId)
      .single();
    
    // Calculate subscription end date based on plan
    let subscriptionEndDate = new Date();
    
    // Get plan details
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('interval')
      .eq('id', payload.planId)
      .maybeSingle();
      
    if (planError) {
      await logger.error(`Error getting plan details: ${planError.message}`);
    } else if (planData?.interval) {
      await logger.info(`Using plan interval: ${planData.interval}`);
      
      const interval = planData.interval;
      if (interval === 'monthly') {
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
      } else if (interval === 'quarterly') {
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 3);
      } else if (interval === 'half-yearly') {
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 6);
      } else if (interval === 'yearly') {
        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
      } else if (interval === 'lifetime') {
        // Set to a very far future date for lifetime
        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 100);
      } else {
        // Default to 1 month for unknown intervals
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
      }
    } else {
      // Default to 1 month if no plan found
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
      await logger.warn('No plan found, defaulting to 1 month subscription');
    }
    
    if (existingMember) {
      // Update existing member
      await supabase
        .from('telegram_chat_members')
        .update({
          subscription_status: 'active',
          is_active: true,
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: subscriptionEndDate.toISOString(),
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
          subscription_end_date: subscriptionEndDate.toISOString(),
          subscription_plan_id: payload.planId
        });
      
      await logger.info(`Added new member ${message.from.id} to community ${payload.communityId}`);
    }
    
    // Log the subscription activity
    await supabase
      .from('subscription_activity_logs')
      .insert({
        telegram_user_id: message.from.id.toString(),
        community_id: payload.communityId,
        activity_type: 'payment_received',
        details: `Payment of ${payment.total_amount / 100} ${payment.currency} received via Telegram`,
        status: 'active'
      });
    
    // Get community information and invite link
    const { data: community } = await supabase
      .from('communities')
      .select('telegram_invite_link, telegram_chat_id, name')
      .eq('id', payload.communityId)
      .single();
      
    // Get or generate an invite link if needed
    let inviteLink = community?.telegram_invite_link;
    
    if (!inviteLink && community?.telegram_chat_id) {
      try {
        // Try to create a new invite link
        const inviteResult = await telegramApi.createChatInviteLink(
          community.telegram_chat_id, 
          `Invite for ${message.from.username || message.from.id} (${new Date().toISOString()})`
        );
        
        if (inviteResult.ok && inviteResult.result?.invite_link) {
          inviteLink = inviteResult.result.invite_link;
          
          // Update community with the new invite link
          await supabase
            .from('communities')
            .update({ telegram_invite_link: inviteLink })
            .eq('id', payload.communityId);
            
          // Also update the payment record with the invite link
          if (paymentRecord?.id) {
            await supabase
              .from('subscription_payments')
              .update({ invite_link: inviteLink })
              .eq('id', paymentRecord.id);
          }
          
          await logger.info(`Created and stored new invite link: ${inviteLink}`);
        }
      } catch (inviteError) {
        await logger.error(`Error creating invite link: ${inviteError.message}`);
      }
    }
    
    // Send thank you message to the user
    let thankYouMessage = "Thank you for your payment! Your subscription has been activated.";
    
    if (inviteLink) {
      thankYouMessage += `\n\nYou can join the community using this link: ${inviteLink}`;
    } else {
      thankYouMessage += "\n\nYou can now join the community by sending a join request to the group.";
    }
    
    await telegramApi.sendMessage(message.from.id.toString(), thankYouMessage);
    
    await logger.success('Sent thank you message to user');
    
    // Try to approve any pending join requests for this user
    try {
      if (community?.telegram_chat_id) {
        // Import the service
        const { JoinRequestService } = await import('./services/joinRequestService.ts');
        const joinRequestService = new JoinRequestService(supabase, botToken);
        
        // Try to approve any pending join request
        const approveResult = await joinRequestService.approveJoinRequest(
          community.telegram_chat_id,
          message.from.id.toString(),
          message.from.username,
          'Payment received'
        );
        
        if (approveResult) {
          await logger.success(`Auto-approved join request for user ${message.from.id} after payment`);
        }
      }
    } catch (approveError) {
      await logger.error(`Error trying to auto-approve join request: ${approveError.message}`);
    }
    
  } catch (error) {
    await logger.error(`Error handling successful payment: ${error.message}`);
  }
}
