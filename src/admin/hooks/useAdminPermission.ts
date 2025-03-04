
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
        
        // Check if the user is in the admin_users table
        const { data, error: queryError } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (queryError) {
          console.error("❌ useAdminPermission: Error checking admin status:", queryError);
          console.error("❌ Error details:", JSON.stringify(queryError, null, 2));
          setError(queryError.message);
          setIsAdmin(false);
        } else {
          // User is an admin if they exist in the admin_users table
          const adminStatus = !!data;
          console.log(`✅ useAdminPermission: Admin check result for ${user.email}:`, { 
            isAdmin: adminStatus, 
            role: data?.role 
          });
          setIsAdmin(adminStatus);
        }
      } catch (err) {
        console.error("❌ useAdminPermission: Error in admin check:", err);
        setError("Failed to verify admin status");
        setIsAdmin(false);
      } finally {
        console.log("✅ useAdminPermission: Finished loading");
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, isLoading, error };
};
