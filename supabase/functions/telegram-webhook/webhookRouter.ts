import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleNewMessage, handleEditedMessage, handleChannelPost } from './handlers/messageHandler.ts';
import { handleChatMemberUpdated } from './handlers/memberUpdateHandler.ts';
import { handleVerification } from './handlers/verification/verificationHandler.ts';
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
  
  try {
    // Enhanced details logging for debugging
    await logger.info("Processing update:", update);
    
    // Check what type of update this is based on the properties
    if (update.message) {
      await logger.info("Detected message update");
      
      // Check if it's a private message to the bot
      if (update.message.chat.type === 'private') {
        await logger.info("Detected private message to bot");
        return await handleNewMessage(supabase, update, context);
      }
      
      // Check if it's a verification message (only in channels/groups)
      if (update.message.text?.startsWith('MBF_')) {
        await logger.info("Detected verification message");
        const isVerified = await handleVerification(supabase, update.message, context.BOT_TOKEN);
        return { success: true, verified: isVerified };
      }
      
      await logger.info("📨 Routing to message handler");
      return await handleNewMessage(supabase, update, context);
    } 
    else if (update.edited_message) {
      await logger.info("Detected edited message update");
      await logger.info("✏️ Routing to edited message handler");
      return await handleEditedMessage(supabase, update);
    } 
    else if (update.channel_post) {
      await logger.info("Detected channel post update");
      
      // Special handling for channel verification messages
      if (update.channel_post.text?.startsWith('MBF_')) {
        await logger.info("Detected verification message in channel");
        const isVerified = await handleVerification(supabase, update.channel_post, context.BOT_TOKEN);
        return { success: true, verified: isVerified };
      }
      
      await logger.info("📢 Routing to channel post handler");
      return await handleChannelPost(supabase, update);
    } 
    else if (update.my_chat_member || update.chat_member) {
      await logger.info("Detected chat member update");
      await logger.info("👥 Routing to chat member update handler");
      return await handleChatMemberUpdated(supabase, update, context.BOT_TOKEN);
    }
    else {
      // Log the update type for debugging
      await logger.info("Unhandled update type:", Object.keys(update).join(', '));
      await logger.warn("⚠️ Unhandled update type");
      return { success: true, message: "Update type not implemented" };
    }
  } catch (error) {
    await logger.error("❌ Error in webhook router:", error);
    // Don't throw errors, just return failure
    return { success: false, error: error.message };
  }
}
