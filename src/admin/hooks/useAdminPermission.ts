
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useAdminPermission = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        
        // Use direct query to admin_users table first (more reliable)
        console.log(`📊 useAdminPermission: Directly querying admin_users table for ${user.id}`);
        
        const { data: directData, error: directError } = await supabase
          .from('admin_users')
          .select('id, role')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();
        
        if (directError) {
          console.error("❌ useAdminPermission: Error with direct query:", directError);
          throw directError;
        }
        
        if (directData) {
          console.log(`✅ useAdminPermission: User ${user.id} is an admin with role: ${directData.role}`);
          setIsAdmin(true);
          setIsLoading(false);
          return;
        } else {
          console.log(`ℹ️ useAdminPermission: User ${user.id} is not an admin according to direct query`);
          
          // Try RPC as fallback to verify (with shorter timeout)
          console.log(`🔄 useAdminPermission: Trying RPC fallback for user ${user.id}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          
          try {
            const { data: rpcData, error: rpcError } = await supabase.rpc(
              'is_admin', 
              { user_uuid: user.id },
              { signal: controller.signal }
            );
            
            clearTimeout(timeoutId);
            
            if (rpcError) {
              console.error("❌ useAdminPermission: RPC fallback failed:", rpcError);
              setIsAdmin(false);
            } else {
              console.log(`📋 useAdminPermission: RPC result: ${!!rpcData}`);
              setIsAdmin(!!rpcData);
            }
          } catch (rpcErr) {
            clearTimeout(timeoutId);
            console.error("❌ useAdminPermission: RPC fallback error:", rpcErr);
            setIsAdmin(false);
          }
          
          setIsLoading(false);
        }
      } catch (err) {
        console.error("❌ useAdminPermission: Error in admin check:", err);
        setError("Failed to verify admin status");
        setIsAdmin(false);
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    checkAdminStatus();
  }, [user]);

  return { isAdmin, isLoading, error };
};
