
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function logWebhookEvent(
  supabase: ReturnType<typeof createClient>,
  update: any,
  message: any,
  handled: boolean
) {
  try {
    console.log(`Logging webhook event: update_id=${update.update_id}, handled=${handled}`);
    
    await supabase.from('telegram_webhook_logs').insert({
      update_id: update.update_id,
      telegram_user_id: message?.from?.id?.toString(),
      chat_id: message?.chat?.id?.toString(),
      event_type: getEventType(update),
      was_handled: handled,
      raw_data: update
    });
  } catch (error) {
    console.error('Error logging webhook event:', error);
  }
}

export async function logWebhookError(
  supabase: ReturnType<typeof createClient>, 
  error: Error,
  update: any
) {
  try {
    console.error(`Logging webhook error: ${error.message}`);
    
    await supabase.from('telegram_errors').insert({
      error_type: 'webhook_error',
      error_message: error.message,
      stack_trace: error.stack,
      update_id: update?.update_id,
      raw_data: update
    });
  } catch (logError) {
    console.error('Error logging webhook error:', logError);
  }
}

function getEventType(update: any): string {
  if (update.message) return 'message';
  if (update.edited_message) return 'edited_message';
  if (update.channel_post) return 'channel_post';
  if (update.callback_query) return 'callback_query';
  if (update.chat_join_request) return 'chat_join_request';
  if (update.my_chat_member) return 'my_chat_member';
  if (update.chat_member) return 'chat_member';
  return 'unknown';
}
