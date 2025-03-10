
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../services/loggingService.ts';

/**
 * Handles Telegram update events
 * @param supabase Supabase client
 * @param update The update data from Telegram
 */
export async function handleUpdate(
  supabase: ReturnType<typeof createClient>,
  update: any
) {
  const logger = createLogger(supabase, 'UPDATE-HANDLER');
  
  try {
    await logger.info(`Processing update: ${JSON.stringify(update).substring(0, 200)}...`);
    
    // Check update type and handle accordingly
    if (update.message) {
      await handleMessage(supabase, update.message);
    } else if (update.callback_query) {
      await handleCallbackQuery(supabase, update.callback_query);
    } else if (update.my_chat_member) {
      await handleMyChatMember(supabase, update.my_chat_member);
    }
    
    return true;
  } catch (error) {
    await logger.error(`Error processing update: ${error.message}`);
    return false;
  }
}

async function handleMessage(supabase: ReturnType<typeof createClient>, message: any) {
  const logger = createLogger(supabase, 'MESSAGE-HANDLER');
  try {
    await logger.info(`Processing message from user ${message.from.id}`);
    
    // Log the message activity
    await supabase
      .from('telegram_activity_logs')
      .insert({
        telegram_user_id: message.from.id.toString(),
        activity_type: 'message',
        details: `Message from user ${message.from.id} in chat ${message.chat.id}`
      });
      
  } catch (error) {
    await logger.error(`Error handling message: ${error.message}`);
  }
}

async function handleCallbackQuery(supabase: ReturnType<typeof createClient>, query: any) {
  const logger = createLogger(supabase, 'CALLBACK-HANDLER');
  try {
    await logger.info(`Processing callback query from user ${query.from.id}`);
    
    // Log the callback query activity
    await supabase
      .from('telegram_activity_logs')
      .insert({
        telegram_user_id: query.from.id.toString(),
        activity_type: 'callback_query',
        details: `Callback query from user ${query.from.id}`
      });
      
  } catch (error) {
    await logger.error(`Error handling callback query: ${error.message}`);
  }
}

async function handleMyChatMember(supabase: ReturnType<typeof createClient>, chatMember: any) {
  const logger = createLogger(supabase, 'CHAT-MEMBER-HANDLER');
  try {
    await logger.info(`Processing chat member update for user ${chatMember.from.id}`);
    
    // Log the chat member update activity
    await supabase
      .from('telegram_activity_logs')
      .insert({
        telegram_user_id: chatMember.from.id.toString(),
        activity_type: 'chat_member_update',
        details: `Chat member update for user ${chatMember.from.id}`
      });
      
  } catch (error) {
    await logger.error(`Error handling chat member update: ${error.message}`);
  }
}
