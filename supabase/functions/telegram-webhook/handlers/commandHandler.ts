import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleStartCommand } from './commands/startHandler.ts';
import { handleHelpCommand } from './commands/helpCommandHandler.ts';
import { createLogger } from '../services/loggingService.ts';

/**
 * Handle command messages from Telegram
 */
export async function handleCommandMessage(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string
) {
  const logger = createLogger(supabase, 'COMMAND-HANDLER');
  
  try {
    const command = message.text.split(' ')[0].toLowerCase();
    const params = message.text.split(' ').slice(1).join(' ');
    
    await logger.info(`📨 Processing command: ${command}`);
    await logger.info(`Parameters: ${params || 'none'}`);
    
    switch (command) {
      case '/start':
        await logger.info("🚀 Forwarding /start command to handleStartCommand()");
        return await handleStartCommand(supabase, message, params, botToken);
        
      case '/help':
        await logger.info("❓ Forwarding /help command to handleHelpCommand()");
        return await handleHelpCommand(supabase, message, botToken);
        
      default:
        await logger.warn(`⚠️ Unknown command: ${command}`);
        return { success: true, message: 'Unknown command' };
    }
  } catch (error) {
    await logger.error("❌ Error handling command:", error);
    return { success: false, error: error.message };
  }
}
