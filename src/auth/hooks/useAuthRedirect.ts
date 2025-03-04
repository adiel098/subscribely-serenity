
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { useCheckAdminStatus } from "./useCheckAdminStatus";

export const useAuthRedirect = (user: User | null) => {
  const navigate = useNavigate();
  const { checkAdminStatus } = useCheckAdminStatus();

  useEffect(() => {
    if (user) {
      console.log("✅ Auth page: User detected, preparing to redirect", user.email);
      
      const redirectTimer = setTimeout(async () => {
        try {
          console.log("🔍 Auth page: Checking admin status for", user.id);
          const { data, error } = await checkAdminStatus(user.id);
          
          if (error) {
            console.error("❌ Auth page: Error checking admin status:", error);
            return navigate('/dashboard', { replace: true });
          }
          
          console.log("✅ Auth page: Admin check result:", data);
          
          // Parse the admin check result properly
          let isAdmin = false;
          let adminRole = null;
          
          if (Array.isArray(data) && data.length > 0) {
            isAdmin = data[0]?.is_admin === true;
            adminRole = data[0]?.admin_role;
          } else if (data) {
            isAdmin = data?.is_admin === true;
            adminRole = data?.admin_role;
          }
          
          if (isAdmin) {
            console.log("✅ Auth page: Admin user confirmed, redirecting to admin dashboard");
            return navigate('/admin/dashboard', { replace: true });
          } else {
            console.log("ℹ️ Auth page: Regular user confirmed, redirecting to dashboard");
            return navigate('/dashboard', { replace: true });
          }
        } catch (err) {
          console.error("❌ Auth page: Exception in admin check:", err);
          console.log("🚀 Auth page: Redirecting to dashboard due to exception");
          return navigate('/dashboard', { replace: true });
        }
      }, 300);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [user, navigate, checkAdminStatus]);
};
