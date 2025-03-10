
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Logs Telegram webhook events to the database for debugging and auditing
 */
export async function logTelegramEvent(
  supabase: ReturnType<typeof createClient>,
  eventType: string,
  eventData: any
): Promise<void> {
  try {
    // Create a safe copy of the event data that won't be too large
    const safeEventData = JSON.stringify(eventData).length > 8000 
      ? { truncated: true, summary: `Event data too large (${JSON.stringify(eventData).length} bytes)` }
      : eventData;
    
    await supabase
      .from('telegram_events')
      .insert({
        event_type: eventType,
        raw_data: safeEventData,
        chat_id: eventData.chat?.id?.toString() || eventData.chat_join_request?.chat?.id?.toString(),
        user_id: eventData.from?.id?.toString() || eventData.chat_join_request?.from?.id?.toString(),
        username: eventData.from?.username || eventData.chat_join_request?.from?.username,
        message_text: eventData.text || eventData.caption || null
      });
      
    console.log(`✅ Event logged: ${eventType}`);
  } catch (error) {
    console.error(`❌ Error logging event: ${error.message}`);
  }
}
