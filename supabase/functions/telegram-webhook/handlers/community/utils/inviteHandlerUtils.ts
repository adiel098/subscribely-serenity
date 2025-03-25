
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendTelegramMessage, isValidTelegramUrl } from '../../../utils/telegramMessenger.ts';
import { createLogger } from '../../../services/loggingService.ts';
import { MINI_APP_WEB_URL } from '../../../utils/botUtils.ts';

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
    await logger.info(`👋 Processing join request for user ${userId} to community ${community.name}`);
    
    // Get bot settings for welcome message configuration
    const { data: botSettings, error: settingsError } = await supabase
      .from('telegram_bot_settings')
      .select('welcome_message, welcome_image, auto_welcome_message')
      .eq('community_id', community.id)
      .single();
      
    if (settingsError) {
      await logger.error(`❌ Error fetching bot settings:`, settingsError);
      return false;
    }
    
    // Log welcome image details for debugging
    await logger.info(`🖼️ Welcome image status for community ${community.id}: ${botSettings?.welcome_image ? 'PRESENT' : 'NOT SET'}`);
    if (botSettings?.welcome_image) {
      const imageType = botSettings.welcome_image.startsWith('data:') 
        ? 'base64' 
        : botSettings.welcome_image.startsWith('https://') 
          ? 'URL' 
          : 'unknown format';
      await logger.info(`🖼️ Image type: ${imageType}, length: ${botSettings.welcome_image.length} chars`);
    }
    
    const customLinkOrId = community.custom_link || community.id;
    const miniAppUrl = `${MINI_APP_WEB_URL}?start=${customLinkOrId}`;
    
    // If auto welcome message is enabled, send the configured welcome message
    const shouldSendWelcome = botSettings.auto_welcome_message !== false;
    
    if (shouldSendWelcome) {
      const welcomeMessage = botSettings.welcome_message || 
        `Welcome to ${community.name}! 👋\nWe're excited to have you here.`;
      
      // Verify the URL is valid for Telegram
      if (!isValidTelegramUrl(miniAppUrl)) {
        await logger.error(`❌ Invalid mini app URL format: ${miniAppUrl}`);
        
        // Send plain message without button
        await sendTelegramMessage(
          botToken,
          message.chat.id,
          `${welcomeMessage}\n\nTo join, use our web app: ${MINI_APP_WEB_URL}`
        );
        
        return true;
      }
      
      // Create the inline keyboard markup
      const inlineKeyboardMarkup = {
        inline_keyboard: [[
          {
            text: "Join Community 🚀",
            web_app: { url: miniAppUrl }
          }
        ]]
      };
      
      try {
        // Send welcome message with image if available
        await logger.info(`📤 Attempting to send welcome message with image: ${botSettings?.welcome_image ? 'YES' : 'NO'}`);
        
        const result = await sendTelegramMessage(
          botToken,
          message.chat.id,
          welcomeMessage,
          inlineKeyboardMarkup,
          botSettings?.welcome_image
        );
        
        if (result.ok) {
          await logger.success(`✅ Sent welcome message to user ${userId}`);
        } else {
          await logger.error(`❌ Error sending welcome message: ${result.description}`);
          
          // Try sending a plain text message as fallback
          await sendTelegramMessage(
            botToken,
            message.chat.id,
            `Welcome to ${community.name}! To join, use this link: ${MINI_APP_WEB_URL}?start=${customLinkOrId}`,
            null,
            null
          );
        }
      } catch (sendError) {
        await logger.error(`❌ Error sending welcome message:`, sendError);
        
        // Try sending a plain text message as final fallback
        try {
          await logger.info(`🔄 Trying fallback: plain text message without image or button`);
          await sendTelegramMessage(
            botToken,
            message.chat.id,
            `Welcome to ${community.name}! To join, use this link: ${MINI_APP_WEB_URL}?start=${customLinkOrId}`
          );
          await logger.info(`✅ Sent fallback plain text message`);
        } catch (finalError) {
          await logger.error(`❌ Complete failure sending any message:`, finalError);
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    await logger.error(`❌ Error in handleCommunityJoinRequest:`, error);
    return false;
  }
}
