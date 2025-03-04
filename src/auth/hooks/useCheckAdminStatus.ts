
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to check if a user is an admin
 * Uses the security definer function to avoid infinite recursion with RLS
 */
export const useCheckAdminStatus = () => {
  const checkAdminStatus = async (userId: string) => {
    if (!userId) {
      console.log("⚠️ useCheckAdminStatus: No user ID provided");
      return { data: null, error: new Error("No user ID provided") };
    }
    
    console.log(`🔍 useCheckAdminStatus: Checking admin status for user ${userId}`);
    try {
      // Use the security definer function to avoid infinite recursion
      const { data, error } = await supabase
        .rpc('get_admin_status', { user_id_param: userId });
      
      if (error) {
        console.error('❌ useCheckAdminStatus: Error checking admin status:', error);
        return { data: null, error };
      }
      
      console.log('✅ useCheckAdminStatus: Admin status result:', data);
      return { data, error: null };
      
    } catch (err) {
      console.error('❌ useCheckAdminStatus: Exception in admin check:', err);
      return { data: null, error: err as Error };
    }
  };

  const checkSuperAdminStatus = async (userId: string) => {
    if (!userId) {
      console.log("⚠️ useCheckAdminStatus: No user ID provided for super admin check");
      return false;
    }
    
    console.log(`🔍 useCheckAdminStatus: Checking super admin status for user ${userId}`);
    try {
      const { data, error } = await checkAdminStatus(userId);
      
      if (error) {
        console.error('❌ useCheckAdminStatus: Error checking super admin status:', error);
        return false;
      }
      
      console.log('✅ useCheckAdminStatus: Super admin check result:', data);
      
      // Handle different response formats
      if (Array.isArray(data) && data.length > 0) {
        return data[0]?.admin_role === 'super_admin';
      }
      return data?.admin_role === 'super_admin';
    } catch (err) {
      console.error('❌ useCheckAdminStatus: Exception in super admin check:', err);
      return false;
    }
  };

  return { checkAdminStatus, checkSuperAdminStatus };
};
