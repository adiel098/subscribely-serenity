import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendTelegramMessage } from '../../utils/telegramMessenger.ts';
import { findCommunityByIdOrLink } from '../../communityHandler.ts';
import { getMiniAppUrl } from '../../utils/botUtils.ts';
import { createLogger } from '../../services/loggingService.ts';

interface Community {
  id: string;
  name: string;
  custom_link?: string;
  telegram_chat_id?: string;
}

/**
 * Handle /start command from Telegram users
 * This is used to:
 * 1. Start the bot with no parameters - shows welcome message
 * 2. Join a community with a specific ID or custom link
 */
export async function handleStartCommand(
  supabase: ReturnType<typeof createClient>,
  message: any,
  params: string,
  botToken: string
): Promise<{ success: boolean; error?: string }> {
  const logger = createLogger(supabase, 'START-COMMAND');
  
  try {
    const chatId = message.chat.id.toString();
    const userId = message.from.id.toString();
    const username = message.from.username;
    
    await logger.info(`🚀 Processing /start command from user ${userId} (${username || 'no username'}) in chat ${chatId}`);
    await logger.info(`Command parameters: "${params}"`);
    
    // If no community ID provided, just send a welcome message
    if (!params) {
      await logger.info('No community ID provided, sending generic welcome message');
      await sendTelegramMessage(
        botToken,
        chatId,
        `Welcome to Membify! 👋\n\nTo join a specific community, you need to use a start link provided by the community owner.`
      );
      return { success: true };
    }
    
    // Find the community by ID or custom link
    await logger.info(`🔍 Looking up community with identifier: ${params}`);
    const community = await findCommunityByIdOrLink(supabase, params);
    
    if (!community) {
      await logger.error(`❌ Community not found for identifier: ${params}`);
      await sendTelegramMessage(
        botToken,
        chatId,
        `❌ Sorry, the community you're trying to join doesn't exist or there was an error.`
      );
      return { success: false, error: 'Community not found' };
    }
    
    await logger.success(`✅ Found community: ${community.name} (ID: ${community.id})`);
    
    // Check if community has at least one active subscription plan and one active payment method
    const { data: plans } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('community_id', community.id)
      .eq('is_active', true)
      .limit(1);
      
    const { data: paymentMethods } = await supabase
      .from('payment_methods')
      .select('id')
      .eq('community_id', community.id)
      .eq('is_active', true)
      .limit(1);
    
    const hasActivePlan = plans && plans.length > 0;
    const hasActivePaymentMethod = paymentMethods && paymentMethods.length > 0;
    
    if (!hasActivePlan || !hasActivePaymentMethod) {
      await logger.warn(`⚠️ Community ${community.id} does not meet requirements: Active Plan: ${hasActivePlan}, Active Payment Method: ${hasActivePaymentMethod}`);
      
      await sendTelegramMessage(
        botToken,
        chatId,
        `⚠️ This community is not fully configured yet. Please contact the administrator.`
      );
      return { success: true };
    }
    
    // Generate mini app URL for subscription
    const miniAppUrl = getMiniAppUrl(community.custom_link || community.id);
    await logger.info(`🔗 Mini app URL generated: ${miniAppUrl}`);
    
    // Send welcome message with subscription button
    const welcomeMessage = `Welcome to *${community.name}*! 🎉\n\nTo join this community and access exclusive content, please subscribe using the button below:`;
    
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: "Join Community 🚀",
            web_app: { url: miniAppUrl }
          }
        ]
      ]
    };
    
    await sendTelegramMessage(
      botToken,
      chatId,
      welcomeMessage,
      inlineKeyboard
    );
    
    await logger.success(`✅ Welcome message sent to user ${userId} for community ${community.name}`);
    return { success: true };
    
  } catch (error) {
    await logger.error(`❌ Error in handleStartCommand:`, error);
    
    try {
      // Send generic error message to the user
      await sendTelegramMessage(
        botToken,
        message.chat.id.toString(),
        `❌ Sorry, there was an error processing your request. Please try again later.`
      );
    } catch (sendError) {
      await logger.error(`Failed to send error message:`, sendError);
    }
    
    return { success: false, error: error.message };
  }
}
