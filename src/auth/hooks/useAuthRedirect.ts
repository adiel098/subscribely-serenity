
import { useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useAuthRedirect() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isRedirectingRef = useRef(false);
  const onboardingCheckedRef = useRef(false);
  
  useEffect(() => {
    // Reset checking status when changing locations outside onboarding
    if (!location.pathname.startsWith('/onboarding')) {
      onboardingCheckedRef.current = false;
    }
    
    if (!isLoading) {
      // If user is not logged in and tries to access protected routes
      if (!user && !location.pathname.startsWith('/auth')) {
        console.log("User not logged in, redirecting to login");
        isRedirectingRef.current = true;
        navigate('/auth', { replace: true, state: { from: location } });
        setTimeout(() => {
          isRedirectingRef.current = false;
        }, 500);
      } 
      // If user is logged in
      else if (user) {
        console.log("User logged in");
        
        // If user tries to access auth pages while logged in
        if (location.pathname.startsWith('/auth') && !isRedirectingRef.current) {
          console.log("User already logged in, redirecting from auth to dashboard");
          isRedirectingRef.current = true;
          navigate('/dashboard', { replace: true });
          setTimeout(() => {
            isRedirectingRef.current = false;
          }, 500);
        }
        
        // Check if we need to verify onboarding status for logged in users
        if (!onboardingCheckedRef.current && !isRedirectingRef.current && !location.pathname.startsWith('/onboarding')) {
          const checkOnboardingStatus = async () => {
            try {
              // Updated to use 'users' table instead of 'profiles'
              const { data, error } = await supabase
                .from('users')
                .select('onboarding_completed, onboarding_step')
                .eq('id', user.id)
                .maybeSingle();
                
              if (error) {
                console.error("Error checking onboarding status:", error);
                return;
              }
              
              if (data && (!data.onboarding_completed && data.onboarding_step !== 'complete')) {
                console.log("Onboarding not complete, redirecting to onboarding");
                isRedirectingRef.current = true;
                navigate('/onboarding', { replace: true });
                setTimeout(() => {
                  isRedirectingRef.current = false;
                }, 500);
              }
              
              onboardingCheckedRef.current = true;
            } catch (err) {
              console.error("Error in onboarding check:", err);
            }
          };
          
          checkOnboardingStatus();
        }
      }
    }
  }, [user, isLoading, navigate, location.pathname, location]);
  
  return {
    isCheckingAuth: isLoading || isRedirectingRef.current
  };
}
