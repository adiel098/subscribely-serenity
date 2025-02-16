
import { createClient } from '@supabase/supabase-js';
import { TelegramEvent } from './types';

export async function logTelegramEvent(supabase: ReturnType<typeof createClient>, eventType: string, data: any, error?: string) {
  try {
    console.log(`Logging ${eventType} event:`, JSON.stringify(data, null, 2));
    
    const eventData: TelegramEvent = {
      event_type: eventType,
      chat_id: data.message?.chat?.id || data.chat?.id || data.chat_join_request?.chat?.id || data.my_chat_member?.chat?.id,
      user_id: data.message?.from?.id || data.from?.id || data.chat_join_request?.from?.id || data.my_chat_member?.from?.id,
      username: data.message?.from?.username || data.from?.username || data.chat_join_request?.from?.username || data.my_chat_member?.from?.username,
      message_id: data.message?.message_id,
      message_text: data.message?.text,
      raw_data: data,
      error: error
    };

    console.log('Prepared event data:', JSON.stringify(eventData, null, 2));

    const { error: checkError } = await supabase
      .from('telegram_events')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking telegram_events table:', checkError);
      return;
    }

    const { error: insertError } = await supabase
      .from('telegram_events')
      .insert([eventData]);

    if (insertError) {
      console.error('Error logging event:', insertError);
    } else {
      console.log('✅ Event logged successfully');
    }
  } catch (err) {
    console.error('Error in logTelegramEvent:', err);
  }
}
