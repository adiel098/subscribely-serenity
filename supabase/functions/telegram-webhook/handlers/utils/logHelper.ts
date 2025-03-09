
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Logs user interaction to database
 */
export async function logUserInteraction(
  supabase: ReturnType<typeof createClient>,
  eventType: string,
  userId: string,
  username: string | undefined,
  messageText: string,
  rawData: any
) {
  try {
    console.log(`[LogHelper] Recording ${eventType} interaction for user ${userId}`);
    
    await supabase
      .from('telegram_events')
      .insert({
        event_type: eventType,
        user_id: userId,
        username: username,
        message_text: messageText,
        raw_data: rawData
      });
      
    console.log(`[LogHelper] Successfully logged ${eventType} event`);
    return true;
  } catch (error) {
    console.error('[LogHelper] Error logging user interaction:', error);
    return false;
  }
}

/**
 * Logs join request events to database with detailed information
 */
export async function logJoinRequestEvent(
  supabase: ReturnType<typeof createClient>,
  chatId: string,
  userId: string,
  username: string | undefined,
  action: 'approved' | 'rejected' | 'received',
  reason: string,
  rawData: any
) {
  try {
    console.log(`[LogHelper] Recording join request ${action} for user ${userId} in chat ${chatId}`);
    
    await supabase
      .from('telegram_events')
      .insert({
        event_type: `join_request_${action}`,
        user_id: userId,
        username: username,
        chat_id: chatId,
        message_text: reason,
        raw_data: rawData
      });
      
    console.log(`[LogHelper] Successfully logged join request ${action} event`);
    return true;
  } catch (error) {
    console.error('[LogHelper] Error logging join request event:', error);
    return false;
  }
}

/**
 * Logs membership status changes
 */
export async function logMembershipChange(
  supabase: ReturnType<typeof createClient>,
  chatId: string,
  userId: string,
  username: string | undefined,
  status: string,
  details: string,
  rawData: any
) {
  try {
    console.log(`[LogHelper] Recording membership status change to ${status} for user ${userId} in chat ${chatId}`);
    
    await supabase
      .from('telegram_events')
      .insert({
        event_type: `membership_${status}`,
        user_id: userId,
        username: username,
        chat_id: chatId,
        message_text: details,
        raw_data: rawData
      });
      
    console.log(`[LogHelper] Successfully logged membership change event`);
    return true;
  } catch (error) {
    console.error('[LogHelper] Error logging membership change:', error);
    return false;
  }
}
