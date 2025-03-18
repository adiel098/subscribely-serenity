import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendTelegramMessage } from '../../../utils/telegramMessenger.ts';
import { createLogger } from '../../../services/loggingService.ts';

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
    
    const customLinkOrId = group.custom_link || group.id;
    const miniAppUrl = `https://preview--subscribely-serenity.lovable.app/telegram-mini-app?start=${customLinkOrId}`;
    
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
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        welcomeMessage,
        inlineKeyboard,
        botSettings?.welcome_image
      );
      
      await logger.success(`✅ Sent welcome message to user ${userId}`);
    } catch (sendError) {
      await logger.error(`❌ Error sending welcome message:`, sendError);
      
      // Try sending a plain text message as fallback
      try {
        await sendTelegramMessage(
          botToken,
          message.chat.id,
          `Welcome to ${group.name}! To join, use this link: ${miniAppUrl}`,
          null,
          null
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
