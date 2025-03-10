
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Log webhook event to the database
 */
export async function logWebhookEvent(
  supabase: ReturnType<typeof createClient>,
  update: any,
  message: any,
  handled: boolean
): Promise<void> {
  try {
    console.log("[EVENT-LOGGING] 📝 Logging event to database");
    await supabase
      .from('telegram_events')
      .insert({
        event_type: update.channel_post ? 'channel_post' : 'webhook_update',
        raw_data: update,
        handled: handled,
        chat_id: message.chat?.id?.toString(),
        message_text: message.text,
        username: message.from?.username,
        user_id: message.from?.id?.toString()
      });
    console.log("[EVENT-LOGGING] ✅ Event logged successfully");
  } catch (logError) {
    console.error("[EVENT-LOGGING] ❌ Error logging event:", logError);
  }
}

/**
 * Log error to the database
 */
export async function logWebhookError(
  supabase: ReturnType<typeof createClient>,
  error: Error,
  context?: any
): Promise<void> {
  try {
    console.error('[EVENT-LOGGING] ❌ Error logging to database:', error);
    
    await supabase.from('telegram_errors').insert({
      error_type: 'webhook_router_error',
      error_message: error.message,
      stack_trace: error.stack,
      raw_data: context
    });
  } catch (logError) {
    console.error('[EVENT-LOGGING] ❌ Failed to log error to database:', logError);
  }
}
