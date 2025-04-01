
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../services/loggingService.ts';

/**
 * Handle chat join requests
 */
export async function handleChatJoinRequest(
  supabase: ReturnType<typeof createClient>,
  joinRequest: any,
  botToken: string
): Promise<void> {
  const logger = createLogger(supabase, 'JOIN-REQUEST-HANDLER');
  
  try {
    await logger.info(`Processing join request from user ${joinRequest.from.id} to chat ${joinRequest.chat.id}`);
    
    // Log the join request
    await supabase.from('telegram_join_requests').insert({
      telegram_chat_id: joinRequest.chat.id.toString(),
      telegram_user_id: joinRequest.from.id.toString(),
      telegram_username: joinRequest.from.username,
      status: 'pending',
      raw_data: joinRequest
    });
    
    // You can implement auto-approval logic here if needed
    
    await logger.info(`Join request processed and logged`);
  } catch (error) {
    await logger.error(`Error handling join request:`, error);
  }
}
