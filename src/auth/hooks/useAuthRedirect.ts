
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
        navigate('/auth/login', { replace: true });
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
        
        // Always redirect to dashboard if user is on onboarding route directly
        // We'll check onboarding status from the dashboard instead
        if (location.pathname.startsWith('/onboarding') && !isRedirectingRef.current) {
          console.log("Redirecting from onboarding to dashboard, will check status there");
          isRedirectingRef.current = true;
          navigate('/dashboard', { replace: true });
          setTimeout(() => {
            isRedirectingRef.current = false;
          }, 500);
        }
      }
    }
  }, [user, isLoading, navigate, location.pathname]);
  
  return {
    isCheckingAuth: isLoading || isRedirectingRef.current
  };
}
