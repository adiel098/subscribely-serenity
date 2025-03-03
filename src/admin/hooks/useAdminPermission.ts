
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
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        // Check if the user is in the admin_users table
        const { data, error: queryError } = await supabase
          .from('admin_users')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (queryError) {
          console.error("Error checking admin status:", queryError);
          setError(queryError.message);
          setIsAdmin(false);
        } else {
          // User is an admin if they exist in the admin_users table
          setIsAdmin(!!data);
          console.log("Admin check result:", data);
        }
      } catch (err) {
        console.error("Error in admin check:", err);
        setError("Failed to verify admin status");
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, isLoading, error };
};
