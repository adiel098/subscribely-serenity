
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
  const [lastCheckedId, setLastCheckedId] = useState<string | null>(null);

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
        
        // Call the security definer RPC function that avoids infinite recursion
        const { data: isAdminResult, error: isAdminError } = await supabase
          .rpc('is_admin', { user_uuid: user.id });
        
        if (isAdminError) {
          console.error("❌ useAdminPermission: Error checking admin status:", isAdminError);
          throw isAdminError;
        }
        
        if (!mounted) return;
        
        setIsAdmin(!!isAdminResult);
        setLastCheckedId(user.id);
        
        if (isAdminResult) {
          // Get the role using a security definer function to avoid RLS issues
          const { data: roleData, error: roleError } = await supabase
            .rpc('check_admin_role', { user_uuid: user.id });
            
          if (roleError) {
            console.warn("⚠️ useAdminPermission: Could not fetch admin role:", roleError);
          } else if (roleData) {
            setRole(roleData);
            console.log(`✅ useAdminPermission: User ${user.id} is admin with role: ${roleData}`);
          }
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
