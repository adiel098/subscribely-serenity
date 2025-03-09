
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Log user interaction with the bot
 */
export async function logUserInteraction(
  supabase: ReturnType<typeof createClient>,
  interactionType: string,
  telegramUserId: string,
  username: string | undefined,
  text: string,
  rawData: any
): Promise<void> {
  try {
    console.log(`[LogHelper] 📝 Logging ${interactionType} interaction for user ${telegramUserId}`);
    
    const { error } = await supabase
      .from('telegram_user_interactions')
      .insert({
        telegram_user_id: telegramUserId,
        username: username,
        interaction_type: interactionType,
        message_text: text,
        raw_data: rawData
      });
    
    if (error) {
      console.error('[LogHelper] ❌ Error logging user interaction:', error);
    } else {
      console.log('[LogHelper] ✅ User interaction logged successfully');
    }
  } catch (error) {
    console.error('[LogHelper] ❌ Error in logUserInteraction:', error);
  }
}

/**
 * Update member activity timestamp
 */
export async function updateMemberActivity(
  supabase: ReturnType<typeof createClient>,
  telegramUserId: string
): Promise<void> {
  try {
    console.log(`[LogHelper] 🔄 Updating activity timestamp for user ${telegramUserId}`);
    
    const { error } = await supabase
      .from('telegram_chat_members')
      .update({ last_active: new Date().toISOString() })
      .eq('telegram_user_id', telegramUserId);
    
    if (error) {
      // This is expected to fail if the user is not a community member yet
      console.log('[LogHelper] ℹ️ Could not update member activity (probably not a member yet)');
    } else {
      console.log('[LogHelper] ✅ Member activity updated successfully');
    }
  } catch (error) {
    console.error('[LogHelper] ❌ Error in updateMemberActivity:', error);
  }
}

/**
 * Log join request events
 */
export async function logJoinRequestEvent(
  supabase: ReturnType<typeof createClient>,
  chatId: string,
  userId: string,
  username: string | undefined,
  status: string,
  details: string,
  rawData: any
): Promise<void> {
  try {
    console.log(`[LogHelper] 📝 Logging join request event for user ${userId} in chat ${chatId} with status ${status}`);
    
    const { error } = await supabase
      .from('telegram_join_requests')
      .insert({
        chat_id: chatId,
        telegram_user_id: userId,
        username: username,
        status: status,
        details: details,
        raw_data: rawData
      });
    
    if (error) {
      console.error('[LogHelper] ❌ Error logging join request event:', error);
    } else {
      console.log('[LogHelper] ✅ Join request event logged successfully');
    }
  } catch (error) {
    console.error('[LogHelper] ❌ Error in logJoinRequestEvent:', error);
  }
}
