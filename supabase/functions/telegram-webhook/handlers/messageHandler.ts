
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { logTelegramEvent } from '../eventLogger.ts';
import { handleCommand } from './commandHandler.ts';
import { createLogger } from '../services/loggingService.ts';

export async function handleNewMessage(
  supabase: ReturnType<typeof createClient>, 
  update: any, 
  context: { BOT_TOKEN: string }
) {
  const logger = createLogger(supabase, 'MESSAGE-HANDLER');
  
  try {
    await logger.info('🗨️ Processing new message:', JSON.stringify(update.message, null, 2));
    
    const message = update.message;
    
    // First, check if it's a command
    if (message?.text && message.text.startsWith('/')) {
      await logger.info('📨 Detected command, forwarding to command handler');
      const handled = await handleCommand(supabase, message, context.BOT_TOKEN);
      await logger.info(`Command ${handled ? 'handled' : 'not handled'}`);
      return;
    }
    
    // If not a command, handle as regular message
    await logTelegramEvent(supabase, 'new_message', update);
    await logger.info('📝 Regular message processed');
  } catch (error) {
    await logger.error('❌ Error in handleNewMessage:', error);
    throw error;
  }
}

export async function handleEditedMessage(
  supabase: ReturnType<typeof createClient>, 
  update: any
) {
  const logger = createLogger(supabase, 'MESSAGE-HANDLER');
  
  try {
    await logger.info('✏️ Processing edited message:', JSON.stringify(update.edited_message, null, 2));
    await logTelegramEvent(supabase, 'edited_message', update);
  } catch (error) {
    await logger.error('Error in handleEditedMessage:', error);
    throw error;
  }
}

export async function handleChannelPost(
  supabase: ReturnType<typeof createClient>, 
  update: any
) {
  const logger = createLogger(supabase, 'MESSAGE-HANDLER');
  
  try {
    await logger.info('📢 Processing channel post:', JSON.stringify(update.channel_post, null, 2));
    await logTelegramEvent(supabase, 'channel_post', update);
  } catch (error) {
    await logger.error('Error in handleChannelPost:', error);
    throw error;
  }
}
