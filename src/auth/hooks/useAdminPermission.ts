
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
        
        // Update the cache
        adminStatusCache[user.id] = {
          isAdmin: adminFound,
          role: roleFound,
          timestamp: Date.now()
        };
        
        console.log(`✅ useAdminPermission: Final status - User ${user.id} is admin: ${adminFound}, role: ${roleFound || 'none'}`);
        console.log(`✅ useAdminPermission: Admin status cached for user ${user.id}`);
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

  // Function to check if user is a super admin using the security definer function
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
      const { data, error } = await supabase
        .rpc('get_admin_status', { user_id_param: user.id });
        
      if (error) throw error;
      console.log("🔐 isSuperAdmin check result:", data);
      
      // Handle different response formats
      let isSuperAdmin = false;
      if (Array.isArray(data) && data.length > 0) {
        isSuperAdmin = data[0]?.admin_role === 'super_admin';
      } else {
        isSuperAdmin = data?.admin_role === 'super_admin';
      }
      
      // Update the cache
      if (!adminStatusCache[user.id]) {
        adminStatusCache[user.id] = {
          isAdmin: !!data?.is_admin,
          role: data?.admin_role || null,
          timestamp: Date.now()
        };
      }
      
      return isSuperAdmin;
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
