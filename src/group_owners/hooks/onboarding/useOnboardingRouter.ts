
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

  // Check if onboarding is already completed and redirect to dashboard if needed
  useEffect(() => {
    const checkCompletionStatus = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed, onboarding_step')
          .maybeSingle();
        
        if (error) throw error;
        
        if (profile?.onboarding_completed || profile?.onboarding_step === 'complete') {
          console.log("Onboarding already complete, redirecting to dashboard");
          navigate('/dashboard', { replace: true });
          return;
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkCompletionStatus();
  }, [navigate]);

  // Process initial URL path
  useEffect(() => {
    if (!isUrlProcessed && initialLoadRef.current && !isLoading) {
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
    if (onboardingState.isCompleted && !onboardingHookLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [onboardingState.isCompleted, onboardingHookLoading, navigate]);

  // Sync URL path with onboarding state
  useEffect(() => {
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
  }, [location.pathname, onboardingState.currentStep, onboardingHookLoading, isLoading, saveCurrentStep]);

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
