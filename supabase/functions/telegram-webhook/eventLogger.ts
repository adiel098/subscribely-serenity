
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function logTelegramEvent(supabase: ReturnType<typeof createClient>, eventType: string, data: any) {
  try {
    const { error } = await supabase
      .from('telegram_webhook_logs')
      .insert([
        {
          event_type: eventType,
          raw_data: data
        }
      ]);

    if (error) {
      console.error('Error logging event:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in logTelegramEvent:', error);
    throw error;
  }
}
