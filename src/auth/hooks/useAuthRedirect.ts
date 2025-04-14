
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
    // Skip redirects during loading to avoid flashing
    if (isLoading) {
      return;
    }

    // If user is logged in and on the auth page, redirect to dashboard
    if (user && location.pathname === '/auth' && !isRedirectingRef.current) {
      console.log("User already logged in, redirecting from auth to dashboard");
      isRedirectingRef.current = true;
      navigate('/dashboard', { replace: true });
      setTimeout(() => {
        isRedirectingRef.current = false;
      }, 500);
      return;
    }
    
    // If user is NOT logged in and NOT on the auth page, redirect to auth
    if (!user && location.pathname !== '/auth' && !isRedirectingRef.current) {
      console.log("No user logged in, redirecting to auth page");
      isRedirectingRef.current = true;
      navigate('/auth', { replace: true });
      setTimeout(() => {
        isRedirectingRef.current = false;
      }, 500);
      return;
    }
    
    // Reset checking status when changing locations outside onboarding
    if (!location.pathname.startsWith('/onboarding')) {
      onboardingCheckedRef.current = false;
    }
  }, [user, isLoading, navigate, location.pathname]);
  
  return {
    isCheckingAuth: isLoading || isRedirectingRef.current
  };
}
