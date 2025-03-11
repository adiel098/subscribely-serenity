
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Update the user's last activity timestamp
 */
export async function updateMemberActivity(
  supabase: ReturnType<typeof createClient>, 
  userId: string
): Promise<void> {
  try {
    console.log(`[ACTIVITY] 🔄 Updating activity timestamp for user ${userId}`);
    
    // Don't try to update profiles table with telegram ID directly
    // Instead, only update telegram_chat_members which uses telegram_user_id as string
    const { error: memberError } = await supabase
      .from('telegram_chat_members')
      .update({ last_active: new Date().toISOString() })
      .eq('telegram_user_id', userId);
      
    if (memberError && memberError.code !== 'PGRST116') { // Ignore if no rows updated
      console.error(`[ACTIVITY] ❌ Error updating chat member activity: ${memberError.message}`);
    } else {
      console.log(`[ACTIVITY] ✅ Chat member activity updated for user ${userId}`);
    }
    
    // Also update telegram_mini_app_users table
    const { error: miniAppError } = await supabase
      .from('telegram_mini_app_users')
      .update({ last_active: new Date().toISOString() })
      .eq('telegram_id', userId);
      
    if (miniAppError && miniAppError.code !== 'PGRST116') { // Ignore if no rows updated
      console.error(`[ACTIVITY] ❌ Error updating mini app user activity: ${miniAppError.message}`);
    } else {
      console.log(`[ACTIVITY] ✅ Mini app user activity updated for user ${userId}`);
    }
  } catch (error) {
    console.error(`[ACTIVITY] ❌ Error in updateMemberActivity: ${error.message}`);
  }
}
