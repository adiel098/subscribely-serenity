
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
      // Use the new security definer function to avoid infinite recursion
      const { data, error } = await supabase
        .rpc('get_admin_status', { user_id_param: userId });
      
      if (error) {
        console.error('❌ useCheckAdminStatus: Error checking admin status:', error);
        return false;
      }
      
      return !!data?.is_admin;
    } catch (err) {
      console.error('❌ useCheckAdminStatus: Exception in admin check:', err);
      return false;
    }
  };

  const checkSuperAdminStatus = async (userId: string) => {
    if (!userId) return false;
    
    console.log(`🔍 useCheckAdminStatus: Checking super admin status for user ${userId}`);
    try {
      // Use the new security definer function to avoid infinite recursion
      const { data, error } = await supabase
        .rpc('get_admin_status', { user_id_param: userId });
      
      if (error) {
        console.error('❌ useCheckAdminStatus: Error checking super admin status:', error);
        return false;
      }
      
      return data?.admin_role === 'super_admin';
    } catch (err) {
      console.error('❌ useCheckAdminStatus: Exception in super admin check:', err);
      return false;
    }
  };

  return { checkAdminStatus, checkSuperAdminStatus };
};
