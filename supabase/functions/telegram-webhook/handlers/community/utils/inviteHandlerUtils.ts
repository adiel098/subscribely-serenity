
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendTelegramMessage } from '../../../utils/telegramMessenger.ts';
import { createLogger } from '../../../services/loggingService.ts';

/**
 * Handle a community join request from a user
 */
export async function handleCommunityJoinRequest(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string,
  community: any,
  userId: string,
  username: string | undefined
): Promise<boolean> {
  const logger = createLogger(supabase, 'COMMUNITY-JOIN-HANDLER');
  
  try {
    await logger.info(`🚀 Processing join request for user ${userId} to community ${community.id}`);
    
    // Fetch bot settings to get welcome message configuration
    const { data: botSettings, error: botError } = await supabase
      .from('telegram_bot_settings')
      .select('*')
      .eq('community_id', community.id)
      .single();

    if (botError) {
      await logger.error(`❌ Error fetching bot settings: ${botError.message}`);
      return false;
    }
    
    await logger.info(`✅ Got bot settings for community ${community.id}`);

    // Create the Mini App URL for this community with the correct domain - using simplified format
    const miniAppUrl = `https://preview--subscribely-serenity.lovable.app/telegram-mini-app?${community.id}`;
    await logger.info(`🔗 Generated Mini App URL: ${miniAppUrl}`);

    // If auto welcome message is enabled, send the configured welcome message (default is enabled)
    const shouldSendWelcome = botSettings.auto_welcome_message !== false;
    
    if (shouldSendWelcome) {
      const welcomeMessage = botSettings.welcome_message || 
        `Welcome to ${community.name}! 👋\nWe're excited to have you here.`;
      
      await logger.info(`📤 Sending welcome message to user ${userId}`);
      
      try {
        // Create the inline keyboard markup
        const inlineKeyboardMarkup = {
          inline_keyboard: [[
            {
              text: "Join Community 🚀",
              web_app: { url: miniAppUrl }
            }
          ]]
        };
        
        await logger.info(`⌨️ Prepared inline keyboard: ${JSON.stringify(inlineKeyboardMarkup)}`);
        
        // Check if welcome image is valid before attempting to send
        let shouldIncludeImage = false;
        if (botSettings.welcome_image) {
          // Very basic validation to prevent obvious issues
          const imageUrl = botSettings.welcome_image;
          if (typeof imageUrl === 'string' && (
              imageUrl.startsWith('https://') || 
              imageUrl.startsWith('data:image/')
            )) {
            shouldIncludeImage = true;
            await logger.info(`🖼️ Including welcome image in message: ${imageUrl.substring(0, 30)}...`);
          } else {
            await logger.warn(`⚠️ Invalid welcome image format, skipping image: ${
              typeof imageUrl === 'string' ? imageUrl.substring(0, 30) + '...' : 'not a string'
            }`);
          }
        }
        
        try {
          if (shouldIncludeImage) {
            // Send welcome message with image if configured
            await sendTelegramMessage(
              botToken,
              message.chat.id,
              welcomeMessage,
              inlineKeyboardMarkup,
              botSettings.welcome_image
            );
          } else {
            // Send text-only welcome message
            await logger.info(`📝 Sending text-only welcome message`);
            
            await sendTelegramMessage(
              botToken,
              message.chat.id,
              welcomeMessage,
              inlineKeyboardMarkup,
              null
            );
          }
          
          await logger.success(`✅ Successfully sent welcome message to user ${userId}`);
        } catch (sendError) {
          await logger.error(`❌ Error sending welcome message: ${sendError.message}`);
          
          // Final fallback attempt - try to send just a plain text message
          try {
            await sendTelegramMessage(
              botToken,
              message.chat.id,
              `Welcome to ${community.name}! To join, use this link: ${miniAppUrl}`,
              null,
              null
            );
            await logger.info(`✅ Sent fallback plain text message without formatting or images`);
          } catch (finalError) {
            await logger.error(`❌ Complete failure sending any message: ${finalError.message}`);
          }
          
          // We still return true because we want to continue the flow
          // The user will see the error in logs but the function won't fail
        }
      } catch (msgError) {
        await logger.error(`❌ Error sending welcome message: ${msgError.message}`);
        return false;
      }
    } else {
      await logger.info(`ℹ️ Auto welcome message is disabled, skipping welcome message`);
    }

    return true;
  } catch (error) {
    await logger.error(`❌ Error handling community join request: ${error.message}`, error);
    return false;
  }
}
