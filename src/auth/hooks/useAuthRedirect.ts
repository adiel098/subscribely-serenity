import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { useCheckAdminStatus } from "./useCheckAdminStatus";
import { supabase } from "@/integrations/supabase/client";

export const useAuthRedirect = (user: User | null) => {
  const navigate = useNavigate();
  const { checkAdminStatus } = useCheckAdminStatus();

  useEffect(() => {
    if (user) {
      console.log("✅ Auth page: User detected, preparing to redirect", user.email);
      
      const redirectTimer = setTimeout(async () => {
        try {
          console.log("🔍 Auth page: Checking admin status for", user.id);
          const { data: adminData, error: adminError } = await checkAdminStatus(user.id);
          
          if (adminError) {
            console.error("❌ Auth page: Error checking admin status:", adminError);
            return navigate('/dashboard', { replace: true });
          }
          
          console.log("✅ Auth page: Admin check result:", adminData);
          
          // Parse the admin check result properly
          let isAdmin = false;
          let adminRole = null;
          
          if (Array.isArray(adminData) && adminData.length > 0) {
            isAdmin = adminData[0]?.is_admin === true;
            adminRole = adminData[0]?.admin_role;
          } else if (adminData) {
            isAdmin = adminData?.is_admin === true;
            adminRole = adminData?.admin_role;
          }
          
          if (isAdmin) {
            console.log("✅ Auth page: Admin user confirmed, redirecting to admin dashboard");
            return navigate('/admin/dashboard', { replace: true });
          } 
          
          // Check if the user has completed onboarding
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('onboarding_completed, onboarding_step')
            .eq('id', user.id)
            .single();
            
          if (profileError) {
            console.error("❌ Auth page: Error checking onboarding status:", profileError);
            return navigate('/dashboard', { replace: true });
          }
          
          console.log("✅ Auth page: Onboarding status:", profileData);
          
          // If user hasn't completed onboarding, redirect to onboarding flow
          if (!profileData.onboarding_completed) {
            console.log("🚀 Auth page: User hasn't completed onboarding, redirecting to onboarding flow");
            
            // If they have a saved step, go to that step
            if (profileData.onboarding_step) {
              return navigate(`/onboarding/${profileData.onboarding_step}`, { replace: true });
            }
            
            // Otherwise, start at the beginning
            return navigate('/onboarding/welcome', { replace: true });
          }
          
          console.log("ℹ️ Auth page: Regular user confirmed, redirecting to dashboard");
          return navigate('/dashboard', { replace: true });
          
        } catch (err) {
          console.error("❌ Auth page: Exception in auth checks:", err);
          console.log("🚀 Auth page: Redirecting to dashboard due to exception");
          return navigate('/dashboard', { replace: true });
        }
      }, 300);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [user, navigate, checkAdminStatus]);
};
