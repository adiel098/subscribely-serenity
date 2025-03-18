
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleGroupStartCommand } from './group/groupStartHandler.ts';
import { handleCommunityStartCommand } from './community/communityStartHandler.ts';
import { sendTelegramMessage } from '../utils/telegramMessenger.ts';
import { createLogger } from '../services/loggingService.ts';

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
      // No parameter provided, send general welcome message
      await logger.info("👋 No parameter, sending general welcome message");
      
      const welcomeMessage = `👋 Welcome to Membify! This bot helps you manage paid memberships for your Telegram groups.`;
      
      await sendTelegramMessage(botToken, message.chat.id, welcomeMessage);
      
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
