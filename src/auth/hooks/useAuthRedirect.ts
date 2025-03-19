
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

  const checkOnboardingStatus = useCallback(async () => {
    if (!user || isRedirectingRef.current) return;
    
    // Skip onboarding check if already in the onboarding flow
    if (location.pathname.startsWith('/onboarding')) {
      console.log("Currently in onboarding flow, skipping redirect check");
      return;
    }
    
    // Prevent checking more than once in the same render cycle
    if (checkCompletedRef.current) {
      return;
    }
    
    checkCompletedRef.current = true;
    isRedirectingRef.current = true;
    
    try {
      console.log("Checking onboarding status for user:", user.id);
      
      // First check if user has any communities
      const { data: communities, error: communitiesError } = await supabase
        .from('communities')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1);
      
      if (communitiesError) {
        console.error("Error checking communities:", communitiesError);
        throw communitiesError;
      }
      
      // If user has communities, mark onboarding as completed and stay on current page
      if (communities && communities.length > 0) {
        console.log("User has communities, ensuring onboarding is marked as completed");
        
        // Update the profile to mark onboarding as completed to prevent future redirects
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            onboarding_completed: true,
            onboarding_step: "complete"
          })
          .eq('id', user.id);
          
        if (updateError) {
          console.error("Error updating onboarding status:", updateError);
        }
        
        // If on login page, redirect to dashboard
        if (location.pathname.startsWith('/auth')) {
          navigate('/dashboard', { replace: true });
        }
        
        isRedirectingRef.current = false;
        return;
      }
      
      // If user has no communities, check profile to see if onboarding was explicitly completed
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
      
      // If onboarding is explicitly marked as completed despite no communities, respect that setting
      if (profile.onboarding_completed) {
        console.log("Onboarding explicitly marked as completed, staying on current page");
        
        // If on login page, redirect to dashboard
        if (location.pathname.startsWith('/auth')) {
          navigate('/dashboard', { replace: true });
        }
        
        isRedirectingRef.current = false;
        return;
      }
      
      // If user has no communities and onboarding isn't completed, redirect to onboarding
      console.log("No communities and onboarding not completed, redirecting to onboarding flow");
      
      // If there's a saved step, redirect to that step
      if (profile.onboarding_step) {
        navigate(`/onboarding/${profile.onboarding_step}`, { replace: true });
      } else {
        // Otherwise, start at the beginning
        navigate('/onboarding/welcome', { replace: true });
      }
      
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    } finally {
      // Reset the redirecting flag
      setTimeout(() => {
        isRedirectingRef.current = false;
        checkCompletedRef.current = false;
      }, 500);
    }
  }, [user, navigate, location.pathname]);

  useEffect(() => {
    // Reset tracking when location changes
    if (location.pathname.startsWith('/onboarding')) {
      checkCompletedRef.current = false;
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
  }, [user, isLoading, navigate, location.pathname, checkOnboardingStatus]);
}
