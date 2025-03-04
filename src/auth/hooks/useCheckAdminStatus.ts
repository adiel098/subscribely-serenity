
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to check if a user is an admin
 * Uses the security definer function to avoid infinite recursion with RLS
 */
export const useCheckAdminStatus = () => {
  const checkAdminStatus = async (userId: string) => {
    if (!userId) return false;
    
    console.log(`🔍 useCheckAdminStatus: Checking admin status for user ${userId}`);
    try {
      // Use RPC with security definer function to avoid infinite recursion
      const { data, error } = await supabase
        .rpc('is_admin', { user_uuid: userId });
      
      if (error) {
        console.error('❌ useCheckAdminStatus: Error checking admin status:', error);
        return false;
      }
      
      return !!data;
    } catch (err) {
      console.error('❌ useCheckAdminStatus: Exception in admin check:', err);
      return false;
    }
  };

  return { checkAdminStatus };
};
