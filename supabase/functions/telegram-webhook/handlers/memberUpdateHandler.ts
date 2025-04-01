
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createLogger } from '../services/loggingService.ts';

/**
 * Handle chat member update events (joins, leaves, kicks, etc.)
 */
export async function handleChatMemberUpdated(
  supabase: ReturnType<typeof createClient>,
  update: any,
  botToken: string
): Promise<void> {
  const logger = createLogger(supabase, 'MEMBER-UPDATE-HANDLER');
  
  try {
    const memberUpdate = update.my_chat_member || update.chat_member;
    
    if (!memberUpdate) {
      await logger.error('No chat member update data in event');
      return;
    }
    
    await logger.info(`Processing member update for user ${memberUpdate.from.id} in chat ${memberUpdate.chat.id}`);
    
    // Log the member update
    await supabase.from('telegram_member_updates').insert({
      telegram_chat_id: memberUpdate.chat.id.toString(),
      telegram_user_id: memberUpdate.from.id.toString(),
      update_type: update.my_chat_member ? 'my_chat_member' : 'chat_member',
      old_status: memberUpdate.old_chat_member?.status,
      new_status: memberUpdate.new_chat_member?.status,
      raw_data: memberUpdate
    });
    
    await logger.info(`Member update processed and logged`);
  } catch (error) {
    await logger.error(`Error handling member update:`, error);
  }
}
