
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { OnboardingStep } from "./types";
import { supabase } from "@/integrations/supabase/client";

export const useOnboardingRouter = (
  onboardingState: { currentStep: OnboardingStep; isCompleted: boolean },
  onboardingHookLoading: boolean,
  saveCurrentStep: (step: string) => void
) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const initialLoadRef = useRef(true);
  const [isUrlProcessed, setIsUrlProcessed] = useState(false);
  const redirectingRef = useRef(false);
  const completionCheckDoneRef = useRef(false);
  const completedOnboardingRef = useRef(false);

  // Check if onboarding is already completed and redirect to dashboard if needed
  useEffect(() => {
    const checkCompletionStatus = async () => {
      try {
        if (redirectingRef.current || completionCheckDoneRef.current) return;
        
        const { data: profile, error } = await supabase
          .from('users')
          .select('onboarding_completed, onboarding_step')
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .maybeSingle();
        
        if (error) throw error;
        
        completionCheckDoneRef.current = true;
        
        if (profile?.onboarding_completed || profile?.onboarding_step === 'complete') {
          console.log("Onboarding already complete, redirecting to dashboard");
          redirectingRef.current = true;
          completedOnboardingRef.current = true;
          
          // Use setTimeout to avoid React errors during navigation
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 300);
          return;
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only run the check if we're in the onboarding flow
    if (location.pathname.includes('/onboarding') && !redirectingRef.current && !completionCheckDoneRef.current) {
      checkCompletionStatus();
    } else if (!location.pathname.includes('/onboarding')) {
      // If we're not in onboarding, mark as processed
      setIsLoading(false);
      setIsUrlProcessed(true);
    }
  }, [navigate, location.pathname]);

  // Process initial URL path
  useEffect(() => {
    if (!isUrlProcessed && initialLoadRef.current && !isLoading && !redirectingRef.current && location.pathname.includes('/onboarding')) {
      console.log("Processing URL path:", location.pathname);
      const path = location.pathname;
      
      // If user tries to access /onboarding directly, redirect to the proper first step
      if (path === '/onboarding' || path === '/onboarding/') {
        navigate('/onboarding/welcome', { replace: true });
      }
      
      // Prevent redirection to /projects/new during onboarding
      if (location.pathname === '/projects/new') {
        console.log("Preventing redirection to /projects/new during onboarding");
        return;
      }
      
      setIsUrlProcessed(true);
      initialLoadRef.current = false;
    } else if (!location.pathname.includes('/onboarding')) {
      // If we're not in onboarding, mark as processed
      setIsUrlProcessed(true);
    }
  }, [location.pathname, navigate, isUrlProcessed, isLoading]);

  // Redirect to dashboard if onboarding is completed
  useEffect(() => {
    if (onboardingState.isCompleted && !onboardingHookLoading && !redirectingRef.current && location.pathname.includes('/onboarding')) {
      console.log("Onboarding completed, redirecting to dashboard");
      redirectingRef.current = true;
      completedOnboardingRef.current = true;
      
      // Use setTimeout to avoid React errors during navigation
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 300);
    }
  }, [onboardingState.isCompleted, onboardingHookLoading, navigate, location.pathname]);

  // Handle special case for complete step to avoid loops
  useEffect(() => {
    if (onboardingState.currentStep === "complete" && !redirectingRef.current && location.pathname.includes('/onboarding')) {
      console.log("Current step is 'complete', redirecting to dashboard");
      redirectingRef.current = true;
      completedOnboardingRef.current = true;
      
      // Use setTimeout to avoid React errors during navigation
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 300);
    }
  }, [onboardingState.currentStep, navigate, location.pathname]);

  // Sync URL path with onboarding state, but don't do this if we're already marked as completed
  useEffect(() => {
    // Don't update if we're already redirecting or have completed onboarding
    if (redirectingRef.current || completedOnboardingRef.current || !location.pathname.includes('/onboarding')) return;
    
    // Extract the current step from the URL path
    const currentPath = location.pathname;
    const pathStep = currentPath.split('/').pop();
    
    // If URL path contains a valid step and it's different from current state
    if (
      pathStep && 
      pathStep !== onboardingState.currentStep && 
      ["welcome", "project-creation", "custom-bot-setup", "connect-telegram", "completion", "complete"].includes(pathStep) &&
      !onboardingHookLoading &&
      !isLoading
    ) {
      console.log(`Updating step based on URL to: ${pathStep}`);
      saveCurrentStep(pathStep);
    }
    
    // Special case for "complete" step - always redirect to dashboard
    if (pathStep === "complete" && !redirectingRef.current) {
      console.log("URL path is 'complete', redirecting to dashboard");
      redirectingRef.current = true;
      completedOnboardingRef.current = true;
      
      // Use setTimeout to avoid React errors during navigation
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 300);
    }
  }, [location.pathname, onboardingState.currentStep, onboardingHookLoading, isLoading, saveCurrentStep, navigate]);

  return {
    isLoading,
    isUrlProcessed
  };
};
