
import { useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useAuthRedirect() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isRedirectingRef = useRef(false);
  const checkCompletedRef = useRef(false);
  const initialCheckDoneRef = useRef(false);
  
  // Store redirect destination in sessionStorage to prevent flashes
  const setRedirectDestination = useCallback((path: string) => {
    if (path) {
      sessionStorage.setItem('redirectDestination', path);
    }
  }, []);
  
  const getRedirectDestination = useCallback(() => {
    return sessionStorage.getItem('redirectDestination');
  }, []);
  
  const clearRedirectDestination = useCallback(() => {
    sessionStorage.removeItem('redirectDestination');
  }, []);

  const checkOnboardingStatus = useCallback(async () => {
    if (!user || isRedirectingRef.current) return;
    
    // Skip onboarding check if already in the onboarding flow
    if (location.pathname.startsWith('/onboarding')) {
      console.log("Currently in onboarding flow, skipping redirect check");
      return;
    }
    
    // Skip if we've already checked in this session
    if (checkCompletedRef.current) {
      return;
    }
    
    checkCompletedRef.current = true;
    isRedirectingRef.current = true;
    
    try {
      console.log("Checking onboarding status for user:", user.id);
      
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
      
      // If onboarding is complete, redirect to dashboard if needed
      if (profile.onboarding_step === "complete" || profile.onboarding_completed) {
        console.log("Onboarding is marked as complete");
        
        // Set the redirect destination first (this prevents flashing)
        if (location.pathname.startsWith('/auth') || 
            location.pathname.startsWith('/onboarding')) {
          console.log("Setting redirect destination to dashboard");
          setRedirectDestination('/dashboard');
          navigate('/dashboard', { replace: true });
        }
      } else {
        // If onboarding is not complete and not already in onboarding flow
        console.log("Onboarding not completed, redirecting to onboarding flow");
        
        if (!location.pathname.startsWith('/onboarding')) {
          // Set the redirect destination first
          let targetPath = '/onboarding/welcome';
          if (profile.onboarding_step) {
            targetPath = `/onboarding/${profile.onboarding_step}`;
          }
          
          console.log(`Setting redirect destination to ${targetPath}`);
          setRedirectDestination(targetPath);
          navigate(targetPath, { replace: true });
        }
      }
      
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    } finally {
      // Reset the redirecting flag
      setTimeout(() => {
        isRedirectingRef.current = false;
      }, 500);
      
      initialCheckDoneRef.current = true;
    }
  }, [user, navigate, location.pathname, setRedirectDestination]);

  useEffect(() => {
    // Reset tracking when location changes to a non-onboarding page
    if (!location.pathname.startsWith('/onboarding')) {
      checkCompletedRef.current = false;
    }
    
    // If finished loading and has planned redirect, execute it
    const redirectPath = getRedirectDestination();
    if (redirectPath && !isLoading && !isRedirectingRef.current) {
      console.log(`Executing planned redirect to ${redirectPath}`);
      isRedirectingRef.current = true;
      navigate(redirectPath, { replace: true });
      clearRedirectDestination();
      setTimeout(() => {
        isRedirectingRef.current = false;
      }, 500);
      return;
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
        
        // If user tries to access auth pages while logged in
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
  }, [user, isLoading, navigate, location.pathname, checkOnboardingStatus, getRedirectDestination, clearRedirectDestination]);
  
  return {
    isCheckingAuth: isLoading || isRedirectingRef.current
  };
}
