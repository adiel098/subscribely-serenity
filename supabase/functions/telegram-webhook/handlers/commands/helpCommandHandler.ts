
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendTelegramMessage } from '../../utils/telegramMessenger.ts';
import { createLogger } from '../../services/loggingService.ts';

/**
 * Handle the /help command from a Telegram user
 */
export async function handleHelpCommand(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string
): Promise<{ success: boolean; error?: string }> {
  const logger = createLogger(supabase, 'HELP-COMMAND');
  
  try {
    await logger.info("📚 Handling /help command");
    
    const chatId = message.chat.id.toString();
    const userId = message.from.id.toString();
    const username = message.from.username;
    
    await logger.info(`👤 User ID: ${userId}, Username: ${username || 'none'}`);
    
    // Prepare help message
    const helpMessage = `
📘 <b>Membify Bot Commands</b>

/start - Start the bot and access the subscription portal
/help - Show this help message

Need more help? Contact the community owner or visit our website.
    `;
    
    // Send the help message
    const result = await sendTelegramMessage(botToken, chatId, helpMessage);
    
    if (!result.ok) {
      await logger.error(`❌ Failed to send help message: ${result.description}`);
      return { success: false, error: result.description };
    }
    
    await logger.info("✅ Help message sent successfully");
    return { success: true };
  } catch (error) {
    await logger.error("❌ Error handling help command:", error);
    return { success: false, error: error.message };
  }
}
