
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../../services/loggingService.ts';
import { TelegramApiClient } from '../utils/telegramApiClient.ts';

/**
 * Service to unblock a user from a Telegram group
 * This will allow them to join the group again
 */
export async function unblockMemberService(
  supabase: ReturnType<typeof createClient>,
  chatId: string,
  userId: string,
  botToken: string
): Promise<boolean> {
  const logger = createLogger(supabase, 'UNBLOCK-SERVICE');
  
  try {
    await logger.info(`Attempting to unblock user ${userId} from chat ${chatId}`);
    
    // Create Telegram API client
    const telegramClient = new TelegramApiClient(botToken);
    
    // Unban the user so they can rejoin
    try {
      const unbanResult = await telegramClient.unbanChatMember(chatId, userId, true);
      
      if (!unbanResult.ok) {
        // If the API returned "user not found in chat", it's likely they were never banned
        if (unbanResult.description && unbanResult.description.includes("not found")) {
          await logger.warn(`User ${userId} was not found in the chat or wasn't banned. Continuing.`);
        } else {
          await logger.error(`Failed to unblock user: ${unbanResult.description}`);
          return false;
        }
      } else {
        await logger.success(`Successfully unblocked user ${userId} from chat ${chatId}`);
      }
    } catch (unbanError) {
      await logger.error(`Exception in unban operation: ${unbanError.message}`);
      
      // Make a fallback attempt using direct API call
      await logger.info(`Attempting fallback unban method for user ${userId}`);
      
      const unbanEndpoint = `https://api.telegram.org/bot${botToken}/unbanChatMember`;
      const unbanResponse = await fetch(unbanEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId,
          only_if_banned: true // Only unban if they are actually banned
        }),
      });
      
      const unbanResult = await unbanResponse.json();
      
      if (!unbanResult.ok) {
        if (unbanResult.description && unbanResult.description.includes("not found")) {
          await logger.warn(`Fallback: User ${userId} was not found in chat or wasn't banned. Continuing.`);
        } else {
          await logger.error(`Fallback unban also failed: ${unbanResult.description}`);
          return false;
        }
      } else {
        await logger.success(`Fallback unban successful for user ${userId}`);
      }
    }
    
    // Get the community ID to update the database
    const { data: community } = await supabase
      .from('communities')
      .select('id')
      .eq('telegram_chat_id', chatId)
      .single();
      
    if (community) {
      await logger.info(`Updating member status in database for community ${community.id}`);
      
      // Update member status in database to 'inactive' (so they're allowed to subscribe)
      const { error: updateError } = await supabase
        .from('telegram_chat_members')
        .update({
          subscription_status: 'inactive',
          is_active: true // Allow them to be active in the group again
        })
        .eq('telegram_user_id', userId)
        .eq('community_id', community.id);
        
      if (updateError) {
        await logger.error(`Error updating member status: ${updateError.message}`);
        return false;
      } else {
        await logger.success('Successfully updated member status in database to inactive');
      }
      
      // Log the action to activity logs
      await supabase
        .from('subscription_activity_logs')
        .insert({
          telegram_user_id: userId,
          community_id: community.id,
          activity_type: 'member_unblocked',
          details: 'User was unblocked by admin',
          status: 'inactive'
        })
        .then(({ error }) => {
          if (error) {
            logger.error(`Failed to log unblock activity: ${error.message}`);
          }
        });
    } else {
      await logger.error('Could not find community record for chat ID: ' + chatId);
      return false;
    }
    
    return true;
  } catch (error) {
    await logger.error(`Exception in unblockMemberService: ${error.message}`);
    return false;
  }
}
