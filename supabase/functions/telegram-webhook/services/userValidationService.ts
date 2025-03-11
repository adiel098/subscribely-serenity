
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Check if a user is suspended before processing their request
 */
export async function checkUserSuspension(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<boolean> {
  if (!userId) {
    return false; // No user ID means we can't check, so assume not suspended
  }
  
  try {
    // Check user suspension status from telegram_mini_app_users table instead of profiles
    // This avoids the UUID conversion error as telegram_mini_app_users uses telegram_id as string
    const { data: userProfile, error: profileError } = await supabase
      .from('telegram_mini_app_users')
      .select('is_suspended')
      .eq('telegram_id', userId)
      .maybeSingle();
    
    if (profileError) {
      console.error("[USER-VALIDATION] ❌ Error checking user suspension status:", profileError);
      return false; // Error checking means we proceed with caution
    }
    
    if (userProfile?.is_suspended) {
      console.log("[USER-VALIDATION] 🚫 User is suspended:", userId);
      return true; // User is suspended
    }
    
    return false; // User is not suspended
  } catch (error) {
    console.error("[USER-VALIDATION] ❌ Exception checking user suspension:", error);
    return false; // Error means we proceed with caution
  }
}
