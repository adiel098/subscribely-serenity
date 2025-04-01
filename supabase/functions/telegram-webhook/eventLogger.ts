
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Log Telegram events to the database
 */
export async function logTelegramEvent(
  supabase: ReturnType<typeof createClient>,
  eventType: string,
  eventData: any
) {
  try {
    console.log(`Logging telegram event: ${eventType}`);
    
    await supabase
      .from('telegram_events')
      .insert({
        event_type: eventType,
        event_data: eventData
      });
      
    console.log(`Event ${eventType} logged successfully`);
  } catch (error) {
    console.error(`Error logging event ${eventType}:`, error);
  }
}
