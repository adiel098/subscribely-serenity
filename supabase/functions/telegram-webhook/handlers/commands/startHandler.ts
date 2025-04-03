import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendTelegramMessage } from '../../utils/telegramMessenger.ts';
import { findCommunityByIdOrLink } from '../../communityHandler.ts';
import { getMiniAppUrl } from '../../utils/botUtils.ts';
import { createLogger } from '../../services/loggingService.ts';
import { getBotToken } from '../../botSettingsHandler.ts';

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
  defaultBotToken: string
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
      
      const welcomeMessage = `👋 Welcome to Membify!\n\nDiscover and join premium Telegram communities, manage your subscriptions, and track your membership payments - all in one place!\n\nPress the button below to explore communities:`;
      
      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: "Explore Communities 🚀",
              web_app: { url: "https://preview--subscribely-serenity.lovable.app/telegram-mini-app" }
            }
          ]
        ]
      };

      await sendTelegramMessage(
        defaultBotToken,
        chatId,
        welcomeMessage,
        inlineKeyboard
      );
      return { success: true };
    }
    
    // Find the community by ID or custom link
    await logger.info(`🔍 Looking up community with identifier: ${params}`);
    const community = await findCommunityByIdOrLink(supabase, params);
    
    if (!community) {
      await logger.error(`❌ Community not found for identifier: ${params}`);
      try {
        await sendTelegramMessage(
          defaultBotToken,
          chatId,
          `❌ Sorry, the community you're trying to join doesn't exist or there was an error.`
        );
      } catch (sendError) {
        // If sending the error message fails, just log it but don't throw
        await logger.error(`Failed to send error message:`, sendError);
      }
      return { success: false, error: 'Community not found' };
    }
    
    await logger.success(`✅ Found community: ${community.name} (ID: ${community.id})`);
    
    // Get the bot token for this community (could be custom or default)
    const botToken = await getBotToken(supabase, community.id, defaultBotToken);
    await logger.info(`Using bot token for community ${community.id}`);

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
      
      // Generate mini app URL for configuration
      const miniAppUrl = getMiniAppUrl(`${community.custom_link || community.id}/admin`);
      await logger.info(`🔗 Mini app URL generated for admin: ${miniAppUrl}`);
      
      // Send message with configuration button
      const message = `⚠️ This community needs additional configuration before members can join.\n\n`;
      const missingItems = [];
      if (!hasActivePlan) missingItems.push('• Active subscription plan');
      if (!hasActivePaymentMethod) missingItems.push('• Active payment method');
      
      const keyboard = {
        inline_keyboard: [[
          {
            text: '⚙️ Configure Community',
            url: miniAppUrl
          }
        ]]
      };
      
      try {
        await sendTelegramMessage(
          botToken,
          chatId,
          message + missingItems.join('\n') + '\n\nClick below to complete the setup:',
          keyboard
        );
      } catch (sendError) {
        await logger.error(`Failed to send configuration message:`, sendError);
      }
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
        defaultBotToken,
        message.chat.id.toString(),
        `❌ Sorry, there was an error processing your request. Please try again later.`
      );
    } catch (sendError) {
      // If sending the error message fails, just log it but don't throw
      await logger.error(`Failed to send error message:`, sendError);
    }
    
    return { success: false, error: error.message };
  }
}
