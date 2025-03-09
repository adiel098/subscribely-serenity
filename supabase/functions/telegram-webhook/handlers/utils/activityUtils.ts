
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Updates the last_active timestamp for a member in all their communities
 * @param supabase Supabase client
 * @param userId Telegram user ID
 */
export async function updateMemberActivity(supabase: ReturnType<typeof createClient>, userId: string) {
  console.log('[ACTIVITY] 🔄 Updating member activity for user:', userId);
  
  try {
    // Update last_active timestamp for all communities this user is in
    const { error: memberError } = await supabase
      .from('telegram_chat_members')
      .update({
        last_active: new Date().toISOString()
      })
      .eq('telegram_user_id', userId);
      
    if (memberError) {
      console.error('[ACTIVITY] ❌ Error updating member activity:', memberError);
    } else {
      console.log(`[ACTIVITY] ✅ Successfully updated activity for user ${userId}`);
    }
  } catch (error) {
    console.error('[ACTIVITY] ❌ Error in updateMemberActivity:', error);
  }
}
