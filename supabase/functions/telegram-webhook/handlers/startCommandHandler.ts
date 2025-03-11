
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleGroupStartCommand } from './group/groupStartHandler.ts';
import { handleCommunityStartCommand } from './community/communityStartHandler.ts';

/**
 * Handle the /start command from a Telegram user
 */
export async function handleStartCommand(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string
): Promise<boolean> {
  try {
    console.log("🚀 [START-COMMAND] Handling /start command");
    
    // Check if this is a response to the start command
    if (!message?.text || !message.text.startsWith('/start')) {
      console.log("⏭️ [START-COMMAND] Not a start command, skipping");
      return false;
    }
    
    const userId = message.from.id.toString();
    const username = message.from.username;
    
    console.log(`👤 [START-COMMAND] User ID: ${userId}, Username: ${username || 'none'}`);
    
    // Parse start parameters if any
    const startParams = message.text.split(' ');
    const startParam = startParams.length > 1 ? startParams[1] : null;
    
    console.log(`🔍 [START-COMMAND] Start parameter: ${startParam || 'none'}`);
    
    // Route to the appropriate handler based on the parameter
    if (startParam) {
      if (startParam.startsWith('group_')) {
        // This is a group code
        const groupId = startParam.substring(6);
        console.log(`👥👥👥 [START-COMMAND] Group parameter detected: ${groupId}`);
        return await handleGroupStartCommand(supabase, message, botToken, groupId);
      } else {
        // This is likely a community code
        console.log(`🏢 [START-COMMAND] Community parameter detected: ${startParam}`);
        return await handleCommunityStartCommand(supabase, message, botToken, startParam);
      }
    } else {
      // No parameter provided, send general welcome message
      console.log("👋 [START-COMMAND] No parameter, sending general welcome message");
      
      const welcomeMessage = `👋 Welcome to Membify! This bot helps you manage paid memberships for your Telegram groups.`;
      
      await sendTelegramMessage(botToken, message.chat.id, welcomeMessage);
      
      return true;
    }
  } catch (error) {
    console.error("❌ [START-COMMAND] Error handling start command:", error);
    
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
