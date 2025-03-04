
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to check if the current user has admin permissions
 * Uses security definer functions to avoid infinite recursion in RLS policies
 * Implements caching to prevent redundant checks
 */
export const useAdminPermission = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [lastCheckedId, setLastCheckedId] = useState<string | null>(null);
  const hasToastShown = useRef<boolean>(false);

  useEffect(() => {
    let mounted = true;
    
    const checkAdminStatus = async () => {
      if (!user) {
        console.log("⚠️ useAdminPermission: No user found");
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // If we've already checked this user and they're an admin, don't check again
      if (lastCheckedId === user.id && isAdmin) {
        console.log(`🔄 useAdminPermission: Using cached admin status for user ${user.id}`);
        setIsLoading(false);
        return;
      }

      try {
        console.log(`🔍 useAdminPermission: Checking admin status for user ${user.id}`);
        setIsLoading(true);
        
        // Use the security definer function to avoid infinite recursion
        const { data: adminStatus, error: adminError } = await supabase
          .rpc('get_admin_status', { user_id_param: user.id });
        
        if (adminError) {
          console.error("❌ useAdminPermission: Error checking admin status:", adminError);
          throw adminError;
        }
        
        if (!mounted) return;
        
        console.log("🔐 useAdminPermission: Admin status response:", adminStatus);
        
        const isUserAdmin = adminStatus?.is_admin === true;
        setIsAdmin(isUserAdmin);
        setLastCheckedId(user.id);
        
        if (isUserAdmin) {
          setRole(adminStatus?.admin_role || null);
          console.log(`✅ useAdminPermission: User ${user.id} is admin with role: ${adminStatus?.admin_role}`);
        } else {
          console.log(`ℹ️ useAdminPermission: User ${user.id} is not an admin`);
        }
        
      } catch (err: any) {
        console.error("❌ useAdminPermission: Error in admin check:", err);
        if (mounted) {
          setError(err?.message || "Failed to verify admin status");
          setIsAdmin(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkAdminStatus();

    return () => {
      mounted = false;
    };
  }, [user, lastCheckedId, isAdmin]);

  // Function to check if user is a super admin using the security definer function
  const isSuperAdmin = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .rpc('get_admin_status', { user_id_param: user.id });
        
      if (error) throw error;
      console.log("🔐 isSuperAdmin check result:", data);
      return data?.admin_role === 'super_admin';
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
    isSuperAdmin,
    hasToastShown 
  };
};
