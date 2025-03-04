
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
        
        // Use RPC function which is SECURITY DEFINER to avoid RLS issues
        console.log(`📊 Running SQL query to check admin status without RLS for user ${user.id}`);
        
        // Set a timeout for the query
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Admin check timeout")), 4000);
        });
        
        // Run the query with a timeout
        const queryPromise = supabase.rpc('is_admin', { user_uuid: user.id });
        
        // Race the query against the timeout
        const { data, error: queryError } = await Promise.race([
          queryPromise,
          timeoutPromise.then(() => {
            console.log("⏱️ Admin check RPC timed out, falling back to direct query");
            throw new Error("Timeout");
          })
        ]) as any;

        if (queryError) {
          console.error("❌ useAdminPermission: Error checking admin status:", queryError);
          
          // Try a fallback approach if RPC fails
          console.log("🔄 useAdminPermission: Trying fallback admin check...");
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('admin_users')
            .select('id, role')
            .eq('user_id', user.id)
            .limit(1);
            
          if (fallbackError) {
            console.error("❌ useAdminPermission: Fallback also failed:", fallbackError);
            setError(fallbackError.message);
            setIsAdmin(false);
          } else {
            const adminStatus = fallbackData && fallbackData.length > 0;
            console.log(`✅ useAdminPermission: Fallback admin check result:`, { 
              isAdmin: adminStatus, 
              userId: user.id,
              email: user.email,
              role: fallbackData && fallbackData.length > 0 ? fallbackData[0].role : null
            });
            setIsAdmin(adminStatus);
          }
        } else {
          // is_admin RPC returns a boolean
          console.log(`✅ useAdminPermission: Admin check result for ${user.email}:`, {
            isAdmin: !!data,
            userId: user.id,
            data
          });
          setIsAdmin(!!data);
        }
      } catch (err) {
        console.error("❌ useAdminPermission: Error in admin check:", err);
        
        // If it's a timeout error, try the fallback
        if (err.message === "Timeout" || err.message === "Admin check timeout") {
          console.log("🔄 useAdminPermission: Timeout occurred, trying fallback admin check...");
          try {
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('admin_users')
              .select('id, role')
              .eq('user_id', user.id)
              .limit(1);
              
            if (fallbackError) {
              console.error("❌ useAdminPermission: Fallback also failed:", fallbackError);
              setError(fallbackError.message);
              setIsAdmin(false);
            } else {
              const adminStatus = fallbackData && fallbackData.length > 0;
              console.log(`✅ useAdminPermission: Fallback admin check result after timeout:`, { 
                isAdmin: adminStatus, 
                userId: user.id,
                email: user.email,
                role: fallbackData && fallbackData.length > 0 ? fallbackData[0].role : null
              });
              setIsAdmin(adminStatus);
            }
          } catch (fallbackErr) {
            console.error("❌ useAdminPermission: Critical error in fallback:", fallbackErr);
            setError("Failed to verify admin status after multiple attempts");
            setIsAdmin(false);
          }
        } else {
          setError("Failed to verify admin status");
          setIsAdmin(false);
        }
      } finally {
        console.log("✅ useAdminPermission: Finished admin status check");
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    checkAdminStatus();
  }, [user]);

  return { isAdmin, isLoading, error };
};
