
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleStartCommand } from './startCommandHandler.ts';
import { createLogger } from '../services/loggingService.ts';

/**
 * Router for command-based messages received from Telegram
 */
export async function handleCommand(
  supabase: ReturnType<typeof createClient>, 
  message: any, 
  botToken: string
): Promise<boolean> {
  const logger = createLogger(supabase, 'COMMAND-HANDLER');
  
  try {
    // Check if message contains text
    if (!message?.text) {
      await logger.info('No text in message, not a command');
      return false;
    }
    
    // Check if it's a start command
    if (message.text.startsWith('/start')) {
      await logger.info('🚀 Forwarding /start command to handler');
      return await handleStartCommand(supabase, message, botToken);
    }
    
    // Handle other commands here as needed
    // e.g., /help, /settings, etc.
    
    // No recognized command
    await logger.info(`Command not recognized: ${message.text}`);
    return false;
  } catch (error) {
    await logger.error('Error in handleCommand:', error);
    return false;
  }
}
