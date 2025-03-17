
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendTelegramMessage } from '../../../utils/telegramMessenger.ts';
import { createLogger } from '../../../services/loggingService.ts';

/**
 * Handle join request for a group
 */
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
    
    // Use bot settings welcome message if available, otherwise use default
    const welcomeMessage = botSettings?.welcome_message || 
      `✅ Thanks for your interest in ${group.name}!\n\n` +
      `Click the button below to access the subscription options and join the group.`;
    
    // Update: Create mini app URL with direct group ID (without group_ prefix)
    const customLinkOrId = group.custom_link || group.id;
    const miniAppUrl = `https://preview--subscribely-serenity.lovable.app/telegram-mini-app?start=${customLinkOrId}`;
    
    await logger.info(`🔗 Created mini app URL: ${miniAppUrl}`);
    
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
    
    // Check if welcome image exists and is valid
    let shouldIncludeImage = false;
    if (botSettings?.welcome_image) {
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
      // Send message with mini app button and image if available
      if (shouldIncludeImage) {
        await sendTelegramMessage(
          botToken,
          message.chat.id,
          welcomeMessage,
          inlineKeyboard,
          botSettings?.welcome_image
        );
      } else {
        // Send text-only welcome message
        await logger.info(`📝 Sending text-only welcome message`);
        
        await sendTelegramMessage(
          botToken,
          message.chat.id,
          welcomeMessage,
          inlineKeyboard,
          null
        );
      }
      
      await logger.success(`✅ Sent welcome message with mini app button to user ${userId}`);
    } catch (sendError) {
      await logger.error(`❌ Error sending welcome message: ${sendError.message}`);
      
      // Fallback to plain text message
      try {
        await sendTelegramMessage(
          botToken,
          message.chat.id,
          `Welcome to ${group.name}! To join, use this link: ${miniAppUrl}`,
          null,
          null
        );
        await logger.info(`✅ Sent fallback plain text message without formatting or images`);
      } catch (finalError) {
        await logger.error(`❌ Complete failure sending any message: ${finalError.message}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    await logger.error(`❌ Error in handleGroupJoinRequest:`, error);
    return false;
  }
}
