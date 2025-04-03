import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendTelegramMessage } from '../../utils/telegramMessenger.ts';
import { findCommunityByIdOrLink } from '../../communityHandler.ts';
import { getMiniAppUrl } from '../../utils/botUtils.ts';
import { createLogger } from '../../services/loggingService.ts';
import { getBotToken } from '../../botSettingsHandler.ts';
import { sendPhotoWithCaption } from '../../utils/telegram/photoMessages.ts';

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
      await logger.info('No community ID provided, sending welcome message from settings');
      
      // Get welcome message from settings
      const { data: botSettings } = await supabase
        .from('telegram_bot_settings')
        .select('welcome_message')
        .single();
      
      const welcomeMessage = botSettings?.welcome_message || 
        `👋 Welcome to Membify!\n\nDiscover and join premium Telegram communities, manage your subscriptions, and track your membership payments - all in one place!\n\nPress the button below to explore communities:`;
      
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

      try {
        await sendTelegramMessage(defaultBotToken, chatId, welcomeMessage, inlineKeyboard);
      } catch (error) {
        await logger.error('Failed to send welcome message:', error);
      }
      return { success: true };
    }
    
    // Find the community by ID or custom link
    await logger.info(`🔍 Looking up community with identifier: ${params}`);
    const community = await findCommunityByIdOrLink(supabase, params);
    
    if (!community) {
      await logger.warn(`Community not found for ID/link: ${params}`);
      await sendTelegramMessage(
        defaultBotToken,
        chatId,
        '❌ Sorry, this community was not found. Please check the link and try again.',
        {
          inline_keyboard: [
            [
              {
                text: "Explore Communities 🚀",
                web_app: { url: "https://preview--subscribely-serenity.lovable.app/telegram-mini-app" }
              }
            ]
          ]
        }
      );
      return { success: true };
    }

    // Pass the community code in the URL
    const communityCode = community.custom_link || community.id;
    const miniAppUrl = `https://preview--subscribely-serenity.lovable.app/telegram-mini-app?start=${communityCode}`;

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
      
    // Get the community owner's ID
    const { data: communityOwner } = await supabase
      .from('communities')
      .select('owner_id')
      .eq('id', community.id)
      .single();
    
    // Check if owner has any active payment methods
    const { data: ownerPaymentMethods } = await supabase
      .from('payment_methods')
      .select('id')
      .eq('owner_id', communityOwner?.owner_id)
      .eq('is_active', true)
      .limit(1);
    
    const hasActivePlan = plans && plans.length > 0;
    const hasActivePaymentMethod = ownerPaymentMethods && ownerPaymentMethods.length > 0;
    
    if (!hasActivePlan || !hasActivePaymentMethod) {
      await logger.warn(`⚠️ Community ${community.id} does not meet requirements: Active Plan: ${hasActivePlan}, Active Payment Method: ${hasActivePaymentMethod}`);
      
      // Generate mini app URL for configuration
      const miniAppUrlConfig = getMiniAppUrl(`${community.custom_link || community.id}/admin`);
      await logger.info(`🔗 Mini app URL generated for admin: ${miniAppUrlConfig}`);
      
      // Send message with configuration button
      const message = `⚠️ This community needs additional configuration before members can join.\n\n`;
      const missingItems = [];
      if (!hasActivePlan) missingItems.push('• Active subscription plan');
      if (!hasActivePaymentMethod) missingItems.push('• Active payment method');
      
      const keyboard = {
        inline_keyboard: [[
          {
            text: '⚙️ Configure Community',
            url: miniAppUrlConfig
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
    
    // Send welcome message with subscription button
    // Get community-specific welcome message and image from settings
    const { data: botSettings } = await supabase
      .from('telegram_bot_settings')
      .select('welcome_message, welcome_image')
      .eq('community_id', community.id)
      .single();

    const welcomeMessage = botSettings?.welcome_message || 
      `Welcome to *${community.name}*! 🎉\n\nTo join this community and access exclusive content, please subscribe using the button below:`;
    
    const keyboard = {
      inline_keyboard: [[
        {
          text: 'Join Community 🚀',
          web_app: { url: `https://preview--subscribely-serenity.lovable.app/telegram-mini-app?start=${community.custom_link || community.id}` }
        }
      ]]
    };
    
    try {
      // If we have a welcome image, send it with the message
      if (botSettings?.welcome_image) {
        await sendPhotoWithCaption(
          botToken,
          chatId,
          botSettings.welcome_image,
          welcomeMessage,
          keyboard
        );
      } else {
        // Otherwise just send the text message
        await sendTelegramMessage(
          botToken,
          chatId,
          welcomeMessage,
          keyboard
        );
      }
      
      await logger.success(`✅ Welcome message sent to user ${userId} for community ${community.name}`);
    } catch (error) {
      await logger.error('Failed to send welcome message:', error);
    }
    
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
