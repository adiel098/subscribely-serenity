
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendTelegramMessage } from '../../../utils/telegramMessenger.ts';
import { createLogger } from '../../../services/loggingService.ts';

/**
 * Handle a user requesting to join a community
 */
export async function handleCommunityJoinRequest(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string,
  community: any,
  userId: string,
  username: string | undefined
): Promise<boolean> {
  const logger = createLogger(supabase, 'COMMUNITY-JOIN');
  
  try {
    await logger.info(`👤 Processing join request for user ${userId} to community ${community.id}`);
    
    // Check if user is already a member of this community
    const { data: existingMember, error: memberError } = await supabase
      .from('community_subscribers')
      .select('*')
      .eq('community_id', community.id)
      .eq('telegram_user_id', userId)
      .single();
    
    if (memberError && memberError.code !== 'PGRST116') { // PGRST116 = not found
      await logger.error(`❌ Error checking existing membership:`, memberError);
      throw new Error('Error checking membership status');
    }
    
    // If user is already a member, check their subscription status
    if (existingMember) {
      await logger.info(`👤 User ${userId} is already a member of community ${community.id}`);
      
      if (existingMember.is_active) {
        // User is an active member, send them a message
        await logger.info(`✅ User ${userId} is an active member`);
        
        await sendTelegramMessage(
          botToken,
          message.chat.id,
          `✅ You are already an active member of <b>${community.name}</b>! Enjoy your subscription.`
        );
        return true;
      } else {
        // User's subscription has expired, prompt them to renew
        await logger.info(`⏱️ User ${userId} has an expired subscription`);
        
        const renewMessage = `
Your subscription to <b>${community.name}</b> has expired.

Would you like to renew your subscription?
        `;
        
        // Create renewal button
        const renewalUrl = `https://app.membify.dev/renew/${community.id}`;
        const inlineKeyboard = {
          inline_keyboard: [
            [
              {
                text: "🔄 Renew Subscription",
                url: renewalUrl
              }
            ]
          ]
        };
        
        await sendTelegramMessage(
          botToken,
          message.chat.id,
          renewMessage,
          inlineKeyboard
        );
        return true;
      }
    }
    
    // User is not a member, show them available subscription plans
    await logger.info(`🔍 Fetching subscription plans for community ${community.id}`);
    
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('community_id', community.id)
      .eq('is_active', true)
      .order('price', { ascending: true });
    
    if (plansError) {
      await logger.error(`❌ Error fetching subscription plans:`, plansError);
      throw new Error('Error fetching subscription plans');
    }
    
    if (!plans || plans.length === 0) {
      await logger.warn(`⚠️ No active subscription plans found for community ${community.id}`);
      
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `⚠️ There are no active subscription plans available for <b>${community.name}</b> at the moment. Please try again later.`
      );
      return true;
    }
    
    // Build the plans message
    let plansMessage = `
Welcome to <b>${community.name}</b>! 👋

Please choose a subscription plan to join:
    `;
    
    // Build the inline keyboard with subscription options
    const subscribeButtons = plans.map(plan => {
      const buttonLabel = `${plan.name} - $${plan.price}/${plan.interval}`;
      const subscribeUrl = `https://app.membify.dev/subscribe/${community.id}/${plan.id}`;
      
      return [
        {
          text: buttonLabel,
          url: subscribeUrl
        }
      ];
    });
    
    const inlineKeyboard = {
      inline_keyboard: subscribeButtons
    };
    
    await logger.info(`📤 Sending subscription plans to user ${userId}`);
    
    await sendTelegramMessage(
      botToken,
      message.chat.id,
      plansMessage,
      inlineKeyboard
    );
    
    // Log the interaction in our system
    await supabase
      .from('subscription_activity_logs')
      .insert({
        telegram_user_id: userId,
        community_id: community.id,
        activity_type: 'viewed_plans',
        details: `User viewed ${plans.length} subscription plans`
      });
    
    return true;
  } catch (error) {
    await logger.error(`❌ Error in handleCommunityJoinRequest:`, error);
    
    // Try to notify the user about the error
    try {
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `❌ Sorry, something went wrong while processing your request. Please try again later.`
      );
    } catch (sendError) {
      await logger.error(`Failed to send error message to user:`, sendError);
    }
    
    return false;
  }
}
