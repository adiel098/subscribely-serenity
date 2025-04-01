
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleNewMessage, handleEditedMessage, handleChannelPost, handleChannelVerification } from './handlers/messageHandler.ts';
import { handleChatMemberUpdated } from './handlers/memberUpdateHandler.ts';
import { createLogger } from './services/loggingService.ts';

/**
 * Route Telegram webhook updates to appropriate handlers
 */
export async function routeTelegramUpdate(
  supabase: ReturnType<typeof createClient>,
  update: any,
  context: { BOT_TOKEN: string }
) {
  const logger = createLogger(supabase, 'webhook-router');
  console.log("Routing Telegram update:", JSON.stringify(update, null, 2));

  try {
    // Enhanced details logging for debugging
    await logger.info("Processing update:", update);
    
    // Check what type of update this is based on the properties
    if (update.message) {
      await logger.info("Detected message update");
      return await handleNewMessage(supabase, update, context);
    } 
    else if (update.edited_message) {
      await logger.info("Detected edited message update");
      return await handleEditedMessage(supabase, update);
    } 
    else if (update.channel_post) {
      await logger.info("Detected channel post update");
      // Special handling for channel verification messages
      if (update.channel_post.text && update.channel_post.text.startsWith('MBF_')) {
        await logger.info("Detected verification message in channel");
        const isVerified = await handleChannelVerification(supabase, update.channel_post, context.BOT_TOKEN);
        return { success: true, verified: isVerified };
      }
      return await handleChannelPost(supabase, update);
    } 
    else if (update.my_chat_member || update.chat_member) {
      await logger.info("Detected chat member update");
      return await handleChatMemberUpdated(supabase, update, context.BOT_TOKEN);
    }
    else {
      // Log the update type for debugging
      await logger.info("Unhandled update type:", Object.keys(update).join(', '));
      return { success: true, message: "Update type not implemented" };
    }
  } catch (error) {
    await logger.error("Error routing Telegram update:", error);
    return {
      success: false,
      error: error.message || "Unknown error in webhook router"
    };
  }
}
