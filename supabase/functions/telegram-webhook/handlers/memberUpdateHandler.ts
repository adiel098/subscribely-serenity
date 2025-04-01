
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../services/loggingService.ts';

/**
 * Handle chat member updates (joins, leaves, etc.)
 */
export async function handleChatMemberUpdated(
  supabase: ReturnType<typeof createClient>,
  update: any,
  botToken: string
) {
  const logger = createLogger(supabase, 'MEMBER-UPDATE');
  
  try {
    const chatMemberUpdate = update.my_chat_member || update.chat_member;
    
    if (!chatMemberUpdate) {
      await logger.error("No chat member update data found");
      return { success: false, error: "No chat member update data" };
    }
    
    const chatId = chatMemberUpdate.chat.id.toString();
    const userId = chatMemberUpdate.from.id.toString();
    const newStatus = chatMemberUpdate.new_chat_member?.status;
    const oldStatus = chatMemberUpdate.old_chat_member?.status;
    
    await logger.info(`Chat member update in ${chatId} for user ${userId}: ${oldStatus} -> ${newStatus}`);
    
    // Log the event to the database for analytics
    await supabase.from('system_logs').insert({
      event_type: 'chat_member_updated',
      details: `Chat member updated in ${chatId}`,
      metadata: {
        chat_id: chatId,
        user_id: userId,
        old_status: oldStatus,
        new_status: newStatus,
        raw_data: chatMemberUpdate
      }
    });
    
    // Process different status changes (administrator, member, left, kicked, etc.)
    if (newStatus === 'administrator' && oldStatus !== 'administrator') {
      await logger.info(`Bot was promoted to admin in chat ${chatId}`);
      
      // Find community with this chat ID and update admin status
      const { data: settings, error } = await supabase
        .from('telegram_bot_settings')
        .update({ is_admin: true })
        .eq('chat_id', chatId)
        .select();
      
      if (error) {
        await logger.error(`Failed to update admin status:`, error);
      }
    } else if (newStatus !== 'administrator' && oldStatus === 'administrator') {
      await logger.info(`Bot was demoted from admin in chat ${chatId}`);
      
      // Update admin status
      const { error } = await supabase
        .from('telegram_bot_settings')
        .update({ is_admin: false })
        .eq('chat_id', chatId);
      
      if (error) {
        await logger.error(`Failed to update admin status:`, error);
      }
    }
    
    return { success: true };
  } catch (error) {
    await logger.error("Error handling chat member update:", error);
    return { success: false, error: error.message };
  }
}
