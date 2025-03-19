
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
    
    // Enhanced logging for all commands
    await logger.info(`Processing command: ${message.text}`);
    
    // Check if it's a start command
    if (message.text.startsWith('/start')) {
      await logger.info('🚀 Forwarding /start command to handleStartCommand()');
      
      // Log all parameters of the start command
      const startParams = message.text.split(' ');
      const param = startParams.length > 1 ? startParams[1] : 'no-parameter';
      await logger.info(`/start command with parameter: ${param}`);
      
      // Log user and chat details
      await logger.info(`User ID: ${message.from.id}, Chat ID: ${message.chat.id}, Username: ${message.from.username || 'none'}`);
      
      // Forward to start command handler
      const result = await handleStartCommand(supabase, message, botToken);
      
      // Log result
      await logger.info(`/start command handling result: ${result ? 'SUCCESS' : 'FAILED'}`);
      
      return result;
    }
    
    // Handle other commands here as needed
    // e.g., /help, /settings, etc.
    
    // No recognized command
    await logger.info(`Command not recognized: ${message.text}`);
    return false;
  } catch (error) {
    await logger.error('Error in handleCommand:', error);
    
    // Log specific details about the error
    if (error instanceof Error) {
      await logger.error(`Error type: ${error.name}, Message: ${error.message}`);
      if (error.stack) {
        await logger.error(`Stack trace: ${error.stack}`);
      }
    }
    
    return false;
  }
}
