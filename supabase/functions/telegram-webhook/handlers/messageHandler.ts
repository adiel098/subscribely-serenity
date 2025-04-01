
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCommandMessage } from './commandHandler.ts';
import { createLogger } from '../services/loggingService.ts';

/**
 * Process a new message from Telegram
 */
export async function handleNewMessage(
  supabase: ReturnType<typeof createClient>,
  update: any,
  context: { BOT_TOKEN: string }
) {
  const logger = createLogger(supabase, 'MESSAGE-HANDLER');
  const message = update.message;
  
  await logger.info("🗨️ Processing new message:");
  await logger.info("Details:", message);
  
  try {
    // Check if it's a command message (starts with '/')
    if (message.text && message.text.startsWith('/')) {
      await logger.info("📨 Detected command, forwarding to command handler");
      return await handleCommandMessage(supabase, message, context.BOT_TOKEN);
    }
    
    // Handle regular messages here if needed
    // For now, just log that we received a message
    await logger.info(`📨 Received regular message from user ${message.from.id}`);
    
    // Consider responding to certain keywords, implementing menu buttons, etc.
    
    await logger.info("Message handled");
    return { success: true };
  } catch (error) {
    await logger.error("Error handling message:", error);
    throw error;
  }
}

/**
 * Process an edited message from Telegram
 */
export async function handleEditedMessage(
  supabase: ReturnType<typeof createClient>,
  update: any
) {
  const logger = createLogger(supabase, 'EDITED-MESSAGE-HANDLER');
  const message = update.edited_message;
  
  await logger.info("🖊️ Processing edited message");
  
  // Just log for now, implement specific handling if needed
  await logger.info(`User ${message.from.id} edited message ${message.message_id}`);
  
  return { success: true };
}

/**
 * Process a channel post
 */
export async function handleChannelPost(
  supabase: ReturnType<typeof createClient>,
  update: any
) {
  const logger = createLogger(supabase, 'CHANNEL-POST-HANDLER');
  const post = update.channel_post;
  
  await logger.info("📢 Processing channel post");
  
  // Just log for now, implement specific handling if needed
  await logger.info(`Channel post in ${post.chat.id}, message ${post.message_id}`);
  
  return { success: true };
}

/**
 * Process channel verification messages
 */
export async function handleChannelVerification(
  supabase: ReturnType<typeof createClient>,
  channelPost: any,
  botToken: string
) {
  const logger = createLogger(supabase, 'CHANNEL-VERIFICATION');
  
  try {
    await logger.info(`🔑 Processing verification message: ${channelPost.text}`);
    
    // Extract the verification code (format: MBF_XXXX)
    const code = channelPost.text.trim();
    const chatId = channelPost.chat.id.toString();
    
    await logger.info(`Verification code: ${code}, Chat ID: ${chatId}`);
    
    // Look up the verification code in the database
    const { data: settings, error } = await supabase
      .from('telegram_bot_settings')
      .select('community_id, verification_code')
      .eq('verification_code', code)
      .is('verified_at', null)
      .single();
    
    if (error || !settings) {
      await logger.error(`❌ Invalid verification code: ${code}`, error);
      return false;
    }
    
    // Update the chat ID and mark as verified
    const { error: updateError } = await supabase
      .from('telegram_bot_settings')
      .update({
        chat_id: chatId,
        verified_at: new Date().toISOString()
      })
      .eq('community_id', settings.community_id);
    
    if (updateError) {
      await logger.error(`❌ Failed to update verification status:`, updateError);
      return false;
    }
    
    // Also update the community with the telegram_chat_id
    const { error: communityError } = await supabase
      .from('communities')
      .update({
        telegram_chat_id: chatId
      })
      .eq('id', settings.community_id);
    
    if (communityError) {
      await logger.error(`❌ Failed to update community:`, communityError);
      // Continue anyway, as the bot settings were updated
    }
    
    await logger.success(`✅ Successfully verified channel with code ${code}`);
    
    // Try to delete the verification message
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: channelPost.message_id
        })
      });
      await logger.info(`🗑️ Deleted verification message`);
    } catch (deleteError) {
      await logger.warn(`⚠️ Could not delete verification message:`, deleteError);
      // Continue anyway
    }
    
    return true;
  } catch (error) {
    await logger.error(`❌ Error in channel verification:`, error);
    return false;
  }
}
