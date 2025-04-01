
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../services/loggingService.ts';

/**
 * Handle updates to chat members (users joining/leaving/being kicked)
 */
export async function handleChatMemberUpdated(
  supabase: ReturnType<typeof createClient>,
  update: any,
  botToken: string
) {
  const logger = createLogger(supabase, 'MEMBER-UPDATE-HANDLER');
  
  try {
    // Check if it's my_chat_member or chat_member
    const memberUpdate = update.my_chat_member || update.chat_member;
    
    if (!memberUpdate) {
      await logger.error("No member update data found");
      return { success: false, error: 'No member update data found' };
    }
    
    await logger.info(`Processing member update in chat ${memberUpdate.chat.id}`);
    
    // Determine the update type
    const oldStatus = memberUpdate.old_chat_member.status;
    const newStatus = memberUpdate.new_chat_member.status;
    const userId = memberUpdate.new_chat_member.user.id.toString();
    const isSelf = memberUpdate.new_chat_member.user.is_bot && 
                   memberUpdate.new_chat_member.user.username === botToken.split(':')[0];
    
    await logger.info(`Member ${userId} status changed from ${oldStatus} to ${newStatus}`);
    
    // If this is about the bot itself
    if (isSelf) {
      await logger.info("Update is about the bot itself");
      
      if (newStatus === 'member' || newStatus === 'administrator') {
        // Bot was added to a group or promoted
        await logger.info(`Bot was added or promoted in chat ${memberUpdate.chat.id}`);
        // You could initialize the bot's settings for this chat here
      } else if (newStatus === 'left' || newStatus === 'kicked') {
        // Bot was removed from a group or kicked
        await logger.info(`Bot was removed from chat ${memberUpdate.chat.id}`);
        // You could clean up the bot's settings for this chat here
      }
      
      // Log to database
      try {
        await supabase.from('telegram_bot_events').insert({
          chat_id: memberUpdate.chat.id.toString(),
          event_type: `bot_${newStatus}`,
          details: `Bot status changed from ${oldStatus} to ${newStatus}`,
          raw_data: memberUpdate
        });
      } catch (error) {
        await logger.error("Error logging bot event:", error);
      }
    } else {
      // Update is about a regular user
      await logger.info(`User ${userId} status changed in chat ${memberUpdate.chat.id}`);
      
      if (newStatus === 'member' && (oldStatus === 'left' || oldStatus === 'kicked')) {
        // User joined the group
        await logger.info(`User ${userId} joined chat ${memberUpdate.chat.id}`);
        // Handle user joining
      } else if ((newStatus === 'left' || newStatus === 'kicked') && oldStatus === 'member') {
        // User left or was kicked from the group
        await logger.info(`User ${userId} left chat ${memberUpdate.chat.id}`);
        // Handle user leaving
      }
      
      // Log to database
      try {
        await supabase.from('telegram_membership_logs').insert({
          telegram_chat_id: memberUpdate.chat.id.toString(),
          telegram_user_id: userId,
          telegram_username: memberUpdate.new_chat_member.user.username,
          event_type: `user_${newStatus}`,
          details: `User status changed from ${oldStatus} to ${newStatus}`,
          raw_data: memberUpdate
        });
      } catch (error) {
        await logger.error("Error logging membership event:", error);
      }
    }
    
    return { success: true };
  } catch (error) {
    await logger.error("Error handling chat member update:", error);
    return { success: false, error: error.message };
  }
}
