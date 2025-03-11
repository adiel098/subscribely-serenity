
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendTelegramMessage } from '../../../utils/telegramMessenger.ts';
import { createLogger } from '../../../services/loggingService.ts';
import { getBotUsername } from '../../../utils/botUtils.ts';

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
      .eq('group_id', group.id)
      .single();
      
    if (settingsError) {
      await logger.error(`❌ Error fetching bot settings:`, settingsError);
      // Continue with default welcome message if settings not found
    }
    
    // Get bot username
    const botUsername = await getBotUsername(supabase);
    
    // Use bot settings welcome message if available, otherwise use default
    const welcomeMessage = botSettings?.welcome_message || 
      `✅ Thanks for your interest in ${group.name}!\n\n` +
      `Click the button below to access the subscription options and join the group.`;
    
    // Create mini app URL with the correct format for web_app buttons
    const miniAppUrl = `https://trkiniaqliiwdkrvvuky.supabase.co/functions/v1/telegram-mini-app?group=${group.id}`;
    
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
    
    // Send message with mini app button
    await sendTelegramMessage(
      botToken,
      message.chat.id,
      welcomeMessage,
      botSettings?.welcome_image || null,
      inlineKeyboard
    );
    
    await logger.success(`✅ Sent welcome message with mini app button to user ${userId}`);
    return true;
  } catch (error) {
    await logger.error(`❌ Error in handleGroupJoinRequest:`, error);
    return false;
  }
}
