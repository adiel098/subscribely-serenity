
import { useState, useEffect } from "react";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to check if the current user has admin permissions
 * Uses security definer functions to avoid infinite recursion in RLS policies
 */
export const useAdminPermission = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        console.log("⚠️ useAdminPermission: No user found");
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        console.log(`🔍 useAdminPermission: Checking admin status for user ${user.id}`);
        
        // Call the security definer RPC function that avoids infinite recursion
        const { data: isAdminResult, error: isAdminError } = await supabase
          .rpc('is_admin', { user_uuid: user.id });
        
        if (isAdminError) {
          console.error("❌ useAdminPermission: Error checking admin status:", isAdminError);
          throw isAdminError;
        }
        
        setIsAdmin(!!isAdminResult);
        
        if (isAdminResult) {
          // If user is admin, also fetch their role
          const { data: adminData, error: adminDataError } = await supabase
            .from('admin_users')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();
            
          if (adminDataError) {
            console.warn("⚠️ useAdminPermission: Could not fetch admin role:", adminDataError);
          } else if (adminData) {
            setRole(adminData.role);
            console.log(`✅ useAdminPermission: User ${user.id} is admin with role: ${adminData.role}`);
          }
        } else {
          console.log(`ℹ️ useAdminPermission: User ${user.id} is not an admin`);
        }
        
      } catch (err: any) {
        console.error("❌ useAdminPermission: Error in admin check:", err);
        setError(err?.message || "Failed to verify admin status");
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    checkAdminStatus();
  }, [user]);

  // Function to check if user is a super admin
  const isSuperAdmin = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .rpc('is_super_admin', { user_uuid: user.id });
        
      if (error) throw error;
      return !!data;
    } catch (err) {
      console.error("❌ useAdminPermission: Error checking super admin status:", err);
      return false;
    }
  };

  return { 
    isAdmin, 
    isLoading, 
    error, 
    role,
    isSuperAdmin 
  };
};
