
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
  
  // Check if the user has completed onboarding
  const checkOnboardingStatus = useCallback(async () => {
    if (!user || isRedirectingRef.current || onboardingCheckedRef.current) return;
    
    // Skip onboarding check if already in the onboarding flow
    if (location.pathname.startsWith('/onboarding')) {
      console.log("Currently in onboarding flow, skipping redirect check");
      return;
    }
    
    try {
      console.log("Checking onboarding status for user:", user.id);
      isRedirectingRef.current = true;
      
      // Check profile to see if onboarding_step is "complete"
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed, onboarding_step')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error("Error checking profile:", profileError);
        throw profileError;
      }
      
      console.log("Profile onboarding status:", profile);
      
      // INVERSE LOGIC: Only redirect to onboarding if not complete
      if (!profile.onboarding_step || 
          (profile.onboarding_step !== "complete" && !profile.onboarding_completed)) {
        console.log("Onboarding not completed, redirecting to onboarding flow");
        
        if (!location.pathname.startsWith('/onboarding')) {
          let targetPath = '/onboarding/welcome';
          if (profile.onboarding_step) {
            targetPath = `/onboarding/${profile.onboarding_step}`;
          }
          
          console.log(`Redirecting to ${targetPath}`);
          navigate(targetPath, { replace: true });
        }
      } else {
        console.log("Onboarding is complete, user can stay on current page");
        // If user is on auth page but authenticated and completed onboarding, redirect to dashboard
        if (location.pathname.startsWith('/auth')) {
          console.log("User already logged in, redirecting from auth to dashboard");
          navigate('/dashboard', { replace: true });
        }
      }
      
      // Mark that we've checked onboarding for this session
      onboardingCheckedRef.current = true;
      
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    } finally {
      // Reset the redirecting flag
      setTimeout(() => {
        isRedirectingRef.current = false;
      }, 500);
    }
  }, [user, navigate, location.pathname]);

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
        console.log("User logged in, checking onboarding status");
        // Check onboarding status when user logs in or navigates to a new page
        checkOnboardingStatus();
        
        // If user tries to access auth pages while logged in but not in redirecting state
        if (location.pathname.startsWith('/auth') && !isRedirectingRef.current) {
          console.log("User already logged in, redirecting from auth to dashboard");
          isRedirectingRef.current = true;
          navigate('/dashboard', { replace: true });
          setTimeout(() => {
            isRedirectingRef.current = false;
          }, 500);
        }
      }
    }
  }, [user, isLoading, navigate, location.pathname, checkOnboardingStatus]);
  
  return {
    isCheckingAuth: isLoading || isRedirectingRef.current
  };
}
