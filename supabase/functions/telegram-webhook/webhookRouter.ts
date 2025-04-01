
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleNewMessage, handleEditedMessage, handleChannelPost } from './handlers/messageHandler.ts';
import { handleChatJoinRequest } from './handlers/joinRequestHandler.ts';
import { handleChatMemberUpdated } from './handlers/memberUpdateHandler.ts';
import { logWebhookEvent, logWebhookError } from './services/eventLoggingService.ts';
import { createLogger } from './services/loggingService.ts';

export async function routeTelegramUpdate(supabase: ReturnType<typeof createClient>, update: any, context: { BOT_TOKEN: string }) {
  const logger = createLogger(supabase, 'webhook-router');
  await logger.info("Processing update:", JSON.stringify(update, null, 2));
  
  try {
    // Extract the relevant message/event based on the update type
    const message = update.message || 
                    update.edited_message || 
                    update.channel_post || 
                    update.chat_join_request || 
                    update.my_chat_member || 
                    update.chat_member;

    if (!message) {
      await logger.error("Unrecognized request format");
      return { success: false, error: 'Unrecognized request format' };
    }

    let handled = false;
    
    // Route to the appropriate handler based on update type
    if (update.message) {
      await handleNewMessage(supabase, update, context);
      handled = true;
    } else if (update.edited_message) {
      await handleEditedMessage(supabase, update);
      handled = true;
    } else if (update.channel_post) {
      await handleChannelPost(supabase, update);
      handled = true;
    } else if (update.chat_join_request) {
      await handleChatJoinRequest(supabase, update.chat_join_request, context.BOT_TOKEN);
      handled = true;
    } else if (update.my_chat_member || update.chat_member) {
      await handleChatMemberUpdated(supabase, update, context.BOT_TOKEN);
      handled = true;
    }

    // Log the event whether it was handled or not
    await logWebhookEvent(supabase, update, message, handled);
    
    return { success: true, handled };
  } catch (error) {
    await logger.error("Error processing update:", error);
    
    try {
      await logWebhookError(supabase, error, update);
    } catch (logError) {
      await logger.error("Failed to log error:", logError);
    }
    
    return { success: false, error: error.message };
  }
}
