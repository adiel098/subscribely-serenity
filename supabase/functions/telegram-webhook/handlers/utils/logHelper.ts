
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
