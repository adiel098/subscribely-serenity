
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleGroupStartCommand } from './group/groupStartHandler.ts';
import { handleCommunityStartCommand } from './community/communityStartHandler.ts';
import { sendTelegramMessage, isValidTelegramUrl } from '../utils/telegramMessenger.ts';
import { createLogger } from '../services/loggingService.ts';
import { TELEGRAM_MINI_APP_URL, MINI_APP_WEB_URL } from '../utils/botUtils.ts';

/**
 * Handle the /start command from a Telegram user
 */
export async function handleStartCommand(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string
): Promise<boolean> {
  const logger = createLogger(supabase, 'START-COMMAND');
  
  try {
    await logger.info("🚀 Handling /start command");
    
    // Check if this is a response to the start command
    if (!message?.text || !message.text.startsWith('/start')) {
      await logger.info("⏭️ Not a start command, skipping");
      return false;
    }
    
    const userId = message.from.id.toString();
    const username = message.from.username;
    
    await logger.info(`👤 User ID: ${userId}, Username: ${username || 'none'}`);
    
    // Parse start parameters if any
    const startParams = message.text.split(' ');
    const startParam = startParams.length > 1 ? startParams[1] : null;
    
    await logger.info(`🔍 Start parameter: ${startParam || 'none'}`);
    
    // Route to the appropriate handler based on the parameter
    if (startParam) {
      if (startParam.startsWith('group_')) {
        // This is a group code
        const groupId = startParam.substring(6);
        await logger.info(`👥👥👥 Group parameter detected: ${groupId}`);
        return await handleGroupStartCommand(supabase, message, botToken, groupId);
      } else {
        // This is likely a community code
        await logger.info(`🏢 Community parameter detected: ${startParam}`);
        return await handleCommunityStartCommand(supabase, message, botToken, startParam);
      }
    } else {
      // No parameter provided, send welcome message with Mini App button
      await logger.info("👋 No parameter, sending discovery welcome message");
      
      // Get the mini app URL - this needs to be the web_app URL that starts with https://
      const miniAppUrl = MINI_APP_WEB_URL;
      await logger.info(`Using Mini App Web URL: ${miniAppUrl}`);
      
      const welcomeMessage = `
👋 <b>Welcome to Membify!</b>

Discover and join premium Telegram communities, manage your subscriptions, and track your membership payments - all in one place!

Press the button below to explore communities:
      `;
      
      // Make sure the URL is valid for Telegram web_app buttons
      if (!isValidTelegramUrl(miniAppUrl)) {
        await logger.error(`❌ Invalid mini app URL format: ${miniAppUrl}`);
        
        // Send message without button if URL is invalid
        await sendTelegramMessage(botToken, message.chat.id, welcomeMessage);
        return true;
      }
      
      // Create inline keyboard with web_app button
      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: "🔍 Discover Communities",
              web_app: { url: miniAppUrl }
            }
          ]
        ]
      };
      
      await logger.info(`Sending welcome message with button URL: ${miniAppUrl}`);
      
      const result = await sendTelegramMessage(
        botToken, 
        message.chat.id, 
        welcomeMessage, 
        inlineKeyboard
      );
      
      if (!result.ok) {
        await logger.error(`❌ Failed to send welcome message: ${result.description}`);
        
        // Try sending message without button as fallback
        await sendTelegramMessage(botToken, message.chat.id, welcomeMessage);
      } else {
        await logger.success(`✅ Welcome message sent successfully`);
      }
      
      return true;
    }
  } catch (error) {
    await logger.error("❌ Error handling start command:", error);
    
    // Log the error
    await supabase.from('telegram_errors').insert({
      error_type: 'start_command_error',
      error_message: error.message,
      stack_trace: error.stack,
      raw_data: message
    });
    
    return false;
  }
}
