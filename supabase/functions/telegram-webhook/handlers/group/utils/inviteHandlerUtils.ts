
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendTelegramMessage, isValidTelegramUrl } from '../../../utils/telegramMessenger.ts';
import { createLogger } from '../../../services/loggingService.ts';
import { MINI_APP_WEB_URL } from '../../../utils/botUtils.ts';

export async function handleGroupJoinRequest(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string,
  group: any,
  userId: string,
  username: string | undefined = undefined
): Promise<boolean> {
  const logger = createLogger(supabase, 'GROUP-INVITE-HANDLER');
  
  try {
    await logger.info(`👋 Processing join request for user ${userId} to group ${group.name}`);
    
    // Get bot settings for this group
    const { data: botSettings, error: settingsError } = await supabase
      .from('telegram_bot_settings')
      .select('welcome_message, welcome_image')
      .eq('community_id', group.id)
      .single();
      
    if (settingsError) {
      await logger.error(`❌ Error fetching bot settings:`, settingsError);
      // Continue with default welcome message if settings not found
    }
    
    // Log welcome image details for debugging
    await logger.info(`🖼️ Welcome image status for group ${group.id}: ${botSettings?.welcome_image ? 'PRESENT' : 'NOT SET'}`);
    if (botSettings?.welcome_image) {
      const imageType = botSettings.welcome_image.startsWith('data:') 
        ? 'base64' 
        : botSettings.welcome_image.startsWith('https://') 
          ? 'URL' 
          : 'unknown format';
      await logger.info(`🖼️ Image type: ${imageType}, length: ${botSettings.welcome_image.length} chars`);
    }
    
    // Use bot settings welcome message if available, otherwise use default
    const welcomeMessage = botSettings?.welcome_message || 
      `✅ Thanks for your interest in ${group.name}!\n\n` +
      `Click the button below to access the subscription options and join the group.`;
    
    const customLinkOrId = group.custom_link || group.id;
    const miniAppUrl = `${MINI_APP_WEB_URL}?start=${customLinkOrId}`;
    
    // Verify the URL is valid for Telegram
    if (!isValidTelegramUrl(miniAppUrl)) {
      await logger.error(`❌ Invalid mini app URL format: ${miniAppUrl}`);
      
      // Send plain message without button
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        `Welcome to ${group.name}! To join, use our web app: ${MINI_APP_WEB_URL}`
      );
      
      return true;
    }
    
    // Prepare inline keyboard with web_app button
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: "Subscribe to Join 🚀",
            web_app: { url: miniAppUrl }
          }
        ]
      ]
    };
    
    try {
      // Send welcome message with image if available
      await logger.info(`📤 Attempting to send welcome message with image: ${botSettings?.welcome_image ? 'YES' : 'NO'}`);
      
      const result = await sendTelegramMessage(
        botToken,
        message.chat.id,
        welcomeMessage,
        inlineKeyboard,
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
          `Welcome to ${group.name}! To join, use this link: ${MINI_APP_WEB_URL}?start=${customLinkOrId}`,
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
          `Welcome to ${group.name}! To join, use this link: ${MINI_APP_WEB_URL}?start=${customLinkOrId}`
        );
        await logger.info(`✅ Sent fallback plain text message`);
      } catch (finalError) {
        await logger.error(`❌ Complete failure sending any message:`, finalError);
      }
    }
    
    return true;
  } catch (error) {
    await logger.error(`❌ Error in handleGroupJoinRequest:`, error);
    return false;
  }
}
