
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Create a cache for admin status to avoid repeated checks
interface AdminStatusCache {
  [userId: string]: {
    isAdmin: boolean;
    role: string | null;
    timestamp: number;
  }
}

// In-memory cache of admin status
const adminStatusCache: AdminStatusCache = {};
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

/**
 * Hook to check if the current user has admin permissions
 * Uses edge function to avoid infinite recursion in RLS policies
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

      // Check if we have a valid cached result
      if (adminStatusCache[user.id]) {
        const cachedData = adminStatusCache[user.id];
        const isCacheValid = (Date.now() - cachedData.timestamp) < CACHE_DURATION;
        
        if (isCacheValid) {
          console.log(`🔄 useAdminPermission: Using cached admin status for user ${user.id}`, cachedData);
          setIsAdmin(cachedData.isAdmin);
          setRole(cachedData.role);
          setLastCheckedId(user.id);
          setIsLoading(false);
          return;
        }
      }

      try {
        console.log(`🔍 useAdminPermission: Checking admin status for user ${user.id}`);
        setIsLoading(true);
        
        // Call edge function to check admin status
        const { data: adminData, error: fnError } = await supabase.functions.invoke('get-admin-status', {
          body: { userId: user.id }
        });
        
        if (fnError) {
          console.error("❌ useAdminPermission: Error calling admin status function:", fnError);
          
          // Fallback to rpc if edge function fails
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('get_admin_status', { user_id_param: user.id });
            
          if (rpcError) {
            console.error("❌ useAdminPermission: Fallback also failed:", rpcError);
            throw rpcError;
          }
          
          if (!mounted) return;
          
          const adminFound = !!rpcData?.is_admin;
          const roleFound = rpcData?.admin_role || null;
          
          setIsAdmin(adminFound);
          setRole(roleFound);
          setLastCheckedId(user.id);
          
          // Update the cache
          adminStatusCache[user.id] = {
            isAdmin: adminFound,
            role: roleFound,
            timestamp: Date.now()
          };
          
          console.log(`✅ useAdminPermission: Fallback - User ${user.id} is admin: ${adminFound}, role: ${roleFound || 'none'}`);
        } else {
          if (!mounted) return;
          
          console.log("🔐 useAdminPermission: Admin status response:", adminData);
          
          const adminFound = !!adminData?.is_admin;
          const roleFound = adminData?.admin_role || null;
          
          setIsAdmin(adminFound);
          setRole(roleFound);
          setLastCheckedId(user.id);
          
          // Update the cache
          adminStatusCache[user.id] = {
            isAdmin: adminFound,
            role: roleFound,
            timestamp: Date.now()
          };
          
          console.log(`✅ useAdminPermission: Edge function - User ${user.id} is admin: ${adminFound}, role: ${roleFound || 'none'}`);
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
  }, [user]);

  // Function to check if user is a super admin using the edge function
  const isSuperAdmin = async (): Promise<boolean> => {
    if (!user) return false;
    
    // Check cache first
    if (adminStatusCache[user.id]) {
      const cachedData = adminStatusCache[user.id];
      const isCacheValid = (Date.now() - cachedData.timestamp) < CACHE_DURATION;
      
      if (isCacheValid) {
        return cachedData.role === 'super_admin';
      }
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('get-admin-status', {
        body: { userId: user.id }
      });
        
      if (error) {
        console.error("❌ useAdminPermission: Error checking super admin status:", error);
        return false;
      }
      
      console.log("🔐 isSuperAdmin check result:", data);
      return data?.admin_role === 'super_admin';
    } catch (err) {
      console.error("❌ useAdminPermission: Error checking super admin status:", err);
      return false;
    }
  };

  // Method to invalidate the cache when admin status changes
  const invalidateCache = () => {
    if (user) {
      delete adminStatusCache[user.id];
      console.log(`🔄 useAdminPermission: Cache invalidated for user ${user.id}`);
    }
  };

  return { 
    isAdmin, 
    isLoading, 
    error, 
    role,
    isSuperAdmin,
    invalidateCache,
    hasToastShown 
  };
};
