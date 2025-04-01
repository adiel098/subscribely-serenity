
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../services/loggingService.ts';

/**
 * Handle a chat join request
 */
export async function handleChatJoinRequest(
  supabase: ReturnType<typeof createClient>,
  joinRequest: any,
  botToken: string
) {
  const logger = createLogger(supabase, 'JOIN-REQUEST-HANDLER');
  
  try {
    const userId = joinRequest.from.id.toString();
    const chatId = joinRequest.chat.id.toString();
    const username = joinRequest.from.username;
    
    await logger.info(`Processing join request from user ${userId} to chat ${chatId}`);
    
    // Check if chat is a managed community
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('*')
      .eq('telegram_chat_id', chatId)
      .single();
    
    if (communityError) {
      await logger.warn(`Chat ${chatId} not found in communities table:`, communityError);
      return { success: false, error: 'Community not found' };
    }
    
    // Check if user has an active subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('community_subscribers')
      .select('*')
      .eq('community_id', community.id)
      .eq('telegram_user_id', userId)
      .eq('is_active', true)
      .single();
    
    if (subscriptionError) {
      await logger.info(`User ${userId} does not have an active subscription:`, subscriptionError);
      // Handle the case for users without active subscriptions
      try {
        // Log the join request
        await supabase.from('telegram_join_request_logs').insert({
          telegram_chat_id: chatId,
          telegram_user_id: userId,
          telegram_username: username,
          event_type: 'join_request_pending',
          details: 'User requested to join but has no active subscription'
        });
        
        // Send a message to the user about subscribing
        const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const messageData = {
          chat_id: userId,
          text: `You've requested to join a premium channel. Subscribe to gain access.`,
          parse_mode: 'Markdown'
        };
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messageData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          await logger.error(`Failed to send message to user:`, errorData);
        } else {
          await logger.info(`Sent subscription info to user ${userId}`);
        }
      } catch (error) {
        await logger.error(`Error handling join request without subscription:`, error);
      }
      
      return { success: true, subscription: false };
    }
    
    // User has an active subscription, approve the join request
    try {
      const apiUrl = `https://api.telegram.org/bot${botToken}/approveChatJoinRequest`;
      const approveData = {
        chat_id: chatId,
        user_id: userId
      };
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approveData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        await logger.error(`Failed to approve join request:`, errorData);
        return { success: false, error: 'Failed to approve join request' };
      }
      
      await logger.info(`Approved join request for user ${userId}`);
      
      // Log the approval
      await supabase.from('telegram_join_request_logs').insert({
        telegram_chat_id: chatId,
        telegram_user_id: userId,
        telegram_username: username,
        event_type: 'join_request_approved',
        details: 'User join request approved based on active subscription'
      });
      
      return { success: true, approved: true };
    } catch (error) {
      await logger.error(`Error approving join request:`, error);
      return { success: false, error: error.message };
    }
  } catch (error) {
    await logger.error(`Error in handleChatJoinRequest:`, error);
    return { success: false, error: error.message };
  }
}
