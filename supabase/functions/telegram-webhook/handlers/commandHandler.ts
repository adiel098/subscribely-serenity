
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleStartCommand } from '../handlers/startCommandHandler.ts';
import { handleHelpCommand } from './commands/helpCommandHandler.ts';
import { createLogger } from '../services/loggingService.ts';

/**
 * Handle a command message
 */
export async function handleCommandMessage(
  supabase: ReturnType<typeof createClient>,
  message: any,
  botToken: string
) {
  const logger = createLogger(supabase, 'COMMAND-HANDLER');
  
  try {
    // Extract command and parameters
    const text = message.text;
    const commandMatch = text.match(/^\/([^\s@]+)(?:@\S+)?(?:\s+(.*))?$/);
    
    if (!commandMatch) {
      await logger.warn("Invalid command format");
      return { success: false, error: 'Invalid command format' };
    }
    
    const command = commandMatch[1].toLowerCase();
    const params = commandMatch[2] || '';
    
    await logger.info(`Processing command: /${command} ${params}`);
    
    // User and chat information
    const userId = message.from.id.toString();
    const chatId = message.chat.id.toString();
    const username = message.from.username;
    
    await logger.info(`User ID: ${userId}, Chat ID: ${chatId}, Username: ${username}`);
    
    // Route command to appropriate handler
    let result;
    
    if (command === 'start') {
      await logger.info("🚀 Forwarding /start command to handleStartCommand()");
      result = await handleStartCommand(supabase, message, botToken);
    } else if (command === 'help') {
      await logger.info("ℹ️ Forwarding /help command to handleHelpCommand()");
      result = await handleHelpCommand(supabase, message, botToken);
    } else {
      // Unknown command
      await logger.warn(`Unknown command: /${command}`);
      // Send a message to the user that the command is not recognized
      try {
        // You might want to implement a generic command handler here
        await logger.info(`Command /${command} not implemented`);
      } catch (error) {
        await logger.error(`Error sending unknown command response:`, error);
      }
      
      result = { success: false, error: 'Unknown command' };
    }
    
    await logger.info(`/${command} command handling result: ${result.success ? 'SUCCESS' : 'FAILURE'}`);
    return result;
  } catch (error) {
    await logger.error(`Error handling command:`, error);
    return { success: false, error: error.message };
  }
}
