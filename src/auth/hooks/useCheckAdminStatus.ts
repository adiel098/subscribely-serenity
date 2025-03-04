
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if a user is an admin based on their user ID
 * @param userId The user ID to check
 * @returns Promise that resolves to a boolean indicating admin status
 */
export const useCheckAdminStatus = () => {
  const checkAdminStatus = async (userId: string) => {
    if (!userId) return false;
    
    console.log(`🔍 AuthContext: Checking admin status for user ${userId}`);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('❌ AuthContext: Error checking admin status:', error);
        return false;
      }
      
      return !!data;
    } catch (err) {
      console.error('❌ AuthContext: Exception in admin check:', err);
      return false;
    }
  };

  return { checkAdminStatus };
};
