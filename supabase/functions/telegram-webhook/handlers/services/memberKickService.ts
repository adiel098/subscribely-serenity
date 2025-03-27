
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../../services/loggingService.ts';

// Service to kick (and optionally unban) a user from a group
export async function kickMemberService(
  supabase: ReturnType<typeof createClient>,
  chatId: string,
  userId: string,
  botToken: string,
  unbanAfterKick = true,
  reason: 'removed' | 'expired' = 'removed'
): Promise<boolean> {
  const logger = createLogger(supabase, 'KICK-SERVICE');
  
  try {
    await logger.info(`Attempting to kick user ${userId} from chat ${chatId}, reason: ${reason}`);
    
    // Validate inputs
    if (!chatId || !userId || !botToken) {
      await logger.error(`Missing required parameters: ${!chatId ? 'chatId' : ''} ${!userId ? 'userId' : ''} ${!botToken ? 'botToken' : ''}`);
      return false;
    }

    // First try to kick the member using banChatMember with a short ban time
    const kickEndpoint = `https://api.telegram.org/bot${botToken}/banChatMember`;
    const kickResponse = await fetch(kickEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId,
        until_date: Math.floor(Date.now() / 1000) + 40, // 40 seconds (minimum allowed by Telegram)
      }),
    });
    
    const kickResult = await kickResponse.json();
    
    if (!kickResult.ok) {
      await logger.error(`Failed to kick user: ${kickResult.description}`);
      return false;
    }
    
    await logger.success(`Successfully kicked user ${userId} from chat ${chatId}`);
    
    // After a short delay, unban the user to allow them to rejoin in the future
    if (unbanAfterKick) {
      // Wait 2 seconds before unbanning
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
        .from('community_subscribers')
        .update({
          is_active: false,
          subscription_status: reason
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
