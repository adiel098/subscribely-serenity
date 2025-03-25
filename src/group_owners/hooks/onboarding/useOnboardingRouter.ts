
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
          .from('profiles')
          .select('onboarding_completed, onboarding_step')
          .maybeSingle();
        
        if (error) throw error;
        
        completionCheckDoneRef.current = true;
        
        if (profile?.onboarding_completed || profile?.onboarding_step === 'complete') {
          console.log("Onboarding already complete, redirecting to dashboard");
          redirectingRef.current = true;
          completedOnboardingRef.current = true;
          
          // Use setTimeout to avoid React errors with state updates during rendering
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 100);
          return;
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!redirectingRef.current && !completionCheckDoneRef.current) {
      checkCompletionStatus();
    }
  }, [navigate]);

  // Process initial URL path
  useEffect(() => {
    if (!isUrlProcessed && initialLoadRef.current && !isLoading && !redirectingRef.current) {
      console.log("Processing URL path:", location.pathname);
      const path = location.pathname;
      
      if (path === '/onboarding' || path === '/onboarding/') {
        navigate('/onboarding/welcome', { replace: true });
      }
      
      setIsUrlProcessed(true);
      initialLoadRef.current = false;
    }
  }, [location.pathname, navigate, isUrlProcessed, isLoading]);

  // Redirect to dashboard if onboarding is completed
  useEffect(() => {
    if (onboardingState.isCompleted && !onboardingHookLoading && !redirectingRef.current) {
      console.log("Onboarding completed, redirecting to dashboard");
      redirectingRef.current = true;
      completedOnboardingRef.current = true;
      
      // Use setTimeout to avoid React errors with state updates during rendering
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    }
  }, [onboardingState.isCompleted, onboardingHookLoading, navigate]);

  // Handle special case for complete step to avoid loops
  useEffect(() => {
    if (onboardingState.currentStep === "complete" && !redirectingRef.current) {
      console.log("Current step is 'complete', redirecting to dashboard");
      redirectingRef.current = true;
      completedOnboardingRef.current = true;
      
      // Use setTimeout to avoid React errors with state updates during rendering
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    }
  }, [onboardingState.currentStep, navigate]);

  // Sync URL path with onboarding state, but don't do this if we're already marked as completed
  useEffect(() => {
    // Don't update if we're already redirecting or have completed onboarding
    if (redirectingRef.current || completedOnboardingRef.current) return;
    
    // Extract the current step from the URL path
    const currentPath = location.pathname;
    const pathStep = currentPath.split('/').pop();
    
    // If URL path contains a valid step and it's different from current state
    if (
      pathStep && 
      pathStep !== onboardingState.currentStep && 
      ["welcome", "bot-selection", "custom-bot-setup", "official-bot-setup", "connect-telegram", "complete"].includes(pathStep) &&
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
      
      // Use setTimeout to avoid React errors with state updates during rendering
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    }
  }, [location.pathname, onboardingState.currentStep, onboardingHookLoading, isLoading, saveCurrentStep, navigate]);

  // Handle special case for official-bot-setup
  const handleOfficialBotSetup = () => {
    console.log("Official bot setup detected, redirecting to connect-telegram");
    navigate('/onboarding/connect-telegram', { replace: true });
    return null;
  };

  return {
    isLoading,
    isUrlProcessed,
    handleOfficialBotSetup
  };
};
