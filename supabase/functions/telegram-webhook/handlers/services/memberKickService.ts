
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { TelegramMemberManager } from '../utils/memberManager.ts';

/**
 * Service to handle kicking members from Telegram chats
 */
export async function kickMemberService(
  supabase: ReturnType<typeof createClient>,
  chatId: string,
  userId: string,
  botToken: string
): Promise<boolean> {
  try {
    console.log('[Kick Service] 🚫 Initiating member kick:', { chatId, userId });
    
    // Create member manager instance
    const memberManager = new TelegramMemberManager(supabase, botToken);
    
    // Execute the kick operation
    const result = await memberManager.kickChatMember(chatId, userId);
    
    console.log(`[Kick Service] ${result ? '✅' : '❌'} Member kick ${result ? 'successful' : 'failed'}`);
    return result;
  } catch (error) {
    console.error('[Kick Service] ❌ Error kicking member:', error);
    return false;
  }
}
