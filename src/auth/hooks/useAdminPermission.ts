
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
        const { data, error } = await supabase
          .rpc('get_admin_status', { user_id_param: user.id });
        
        if (error) {
          console.error("❌ useAdminPermission: Error checking admin status:", error);
          throw error;
        }
        
        if (!mounted) return;
        
        console.log("🔐 useAdminPermission: Admin status response:", data);
        
        // Check if data exists and explicitly handle the admin status
        let adminFound = false;
        let roleFound = null;
        
        if (Array.isArray(data) && data.length > 0) {
          adminFound = data[0]?.is_admin === true;
          roleFound = data[0]?.admin_role || null;
          console.log(`✅ useAdminPermission: Array response - admin: ${adminFound}, role: ${roleFound}`);
        } else if (data) {
          adminFound = data.is_admin === true;
          roleFound = data.admin_role || null;
          console.log(`✅ useAdminPermission: Object response - admin: ${adminFound}, role: ${roleFound}`);
        }
        
        setIsAdmin(adminFound);
        setRole(roleFound);
        setLastCheckedId(user.id);
        
        console.log(`✅ useAdminPermission: Final status - User ${user.id} is admin: ${adminFound}, role: ${roleFound || 'none'}`);
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
      
      // Handle different response formats
      if (Array.isArray(data) && data.length > 0) {
        return data[0]?.admin_role === 'super_admin';
      }
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
