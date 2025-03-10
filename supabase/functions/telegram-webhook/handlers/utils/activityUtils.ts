
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
    
    // Update profiles table with last activity
    const { error } = await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);
      
    if (error) {
      console.error(`[ACTIVITY] ❌ Error updating profile activity: ${error.message}`);
    }
    
    // Also update telegram chat members if they exist
    const { error: memberError } = await supabase
      .from('telegram_chat_members')
      .update({ last_active: new Date().toISOString() })
      .eq('telegram_user_id', userId);
      
    if (memberError && memberError.code !== 'PGRST116') { // Ignore if no rows updated
      console.error(`[ACTIVITY] ❌ Error updating chat member activity: ${memberError.message}`);
    }
    
    console.log(`[ACTIVITY] ✅ Activity updated for user ${userId}`);
  } catch (error) {
    console.error(`[ACTIVITY] ❌ Error in updateMemberActivity: ${error.message}`);
  }
}
