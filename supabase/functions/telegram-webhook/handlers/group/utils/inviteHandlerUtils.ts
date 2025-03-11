
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
    
    // Get bot username (for mini app URL construction)
    const botUsername = await getBotUsername(supabase);
    
    // Construct mini app URL for this group
    const miniAppUrl = `https://t.me/${botUsername}/app?startapp=group_${group.id}`;
    
    await logger.info(`🔗 Created mini app URL: ${miniAppUrl}`);
    
    // Prepare welcome message with mini app button
    const welcomeMessage = `✅ Thanks for your interest in ${group.name}!\n\n` +
      `Click the button below to access the subscription options and join the group.`;
    
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
      null, // No photo URL
      inlineKeyboard
    );
    
    await logger.success(`✅ Sent welcome message with mini app button to user ${userId}`);
    return true;
  } catch (error) {
    await logger.error(`❌ Error in handleGroupJoinRequest:`, error);
    return false;
  }
}
