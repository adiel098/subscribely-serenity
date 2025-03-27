
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../../services/loggingService.ts';

// Service to kick (and optionally unban) a user from a group
export async function kickMemberService(
  supabase: ReturnType<typeof createClient>,
  chatId: string,
  userId: string,
  botToken: string,
  unbanAfterKick = true,
  reason: 'removed' | 'expired' = 'removed' // Add reason parameter with default 'removed'
): Promise<boolean> {
  const logger = createLogger(supabase, 'KICK-SERVICE');
  
  try {
    await logger.info(`Attempting to kick user ${userId} from chat ${chatId}, reason: ${reason}`);
    
    // First kick the user
    const kickEndpoint = `https://api.telegram.org/bot${botToken}/kickChatMember`;
    const kickResponse = await fetch(kickEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId,
      }),
    });
    
    const kickResult = await kickResponse.json();
    
    if (!kickResult.ok) {
      await logger.error(`Failed to kick user: ${kickResult.description}`);
      return false;
    }
    
    await logger.success(`Successfully kicked user ${userId} from chat ${chatId}`);
    
    // Unban the user if requested - this allows them to rejoin in the future
    if (unbanAfterKick) {
      await logger.info(`Now unbanning user ${userId} so they can rejoin in the future`);
      
      const unbanEndpoint = `https://api.telegram.org/bot${botToken}/unbanChatMember`;
      const unbanResponse = await fetch(unbanEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId,
          only_if_banned: true,
        }),
      });
      
      const unbanResult = await unbanResponse.json();
      
      if (!unbanResult.ok) {
        await logger.warn(`Failed to unban user: ${unbanResult.description}`);
        // Don't return false here, as the kick operation was still successful
      } else {
        await logger.success(`Successfully unbanned user ${userId}`);
      }
    }
    
    // Update member status in database
    const { data: community } = await supabase
      .from('communities')
      .select('id')
      .eq('telegram_chat_id', chatId)
      .single();
      
    if (community) {
      await logger.info(`Updating member status in database for community ${community.id} with status: ${reason}`);
      
      const { error: updateError } = await supabase
        .from('community_subscribers')  // Changed from telegram_chat_members to community_subscribers
        .update({
          is_active: false,
          subscription_status: reason // Use the provided reason instead of hardcoding 'removed'
        })
        .eq('telegram_user_id', userId)
        .eq('community_id', community.id);
        
      if (updateError) {
        await logger.error(`Error updating member status: ${updateError.message}`);
      } else {
        await logger.success(`Successfully updated member status in database to ${reason}`);
      }
    }
    
    return true;
  } catch (error) {
    await logger.error(`Exception in kickMemberService: ${error.message}`);
    return false;
  }
}
