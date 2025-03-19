
import { useState, useEffect } from "react";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingStep, ONBOARDING_STEPS } from "./onboarding/types";
import { useOnboardingNavigation } from "./onboarding/useOnboardingNavigation";
import { useOnboardingStatus } from "./onboarding/useOnboardingStatus";
import { toast } from "sonner";

export const useOnboarding = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState({
    currentStep: "welcome" as OnboardingStep,
    isCompleted: false
  });

  // Use the status hook to fetch the initial status
  const { state: statusState, isLoading: statusIsLoading, refreshStatus } = useOnboardingStatus();

  // Initialize the navigation functions with the current state
  const { 
    isSubmitting,
    saveCurrentStep,
    completeOnboarding,
    goToNextStep,
    goToPreviousStep
  } = useOnboardingNavigation(
    state.currentStep,
    (step) => setState(prev => ({ ...prev, currentStep: step })),
    (completed) => setState(prev => ({ ...prev, isCompleted: completed }))
  );

  // Update local state when status is loaded
  useEffect(() => {
    if (!statusIsLoading) {
      setState({
        currentStep: statusState.currentStep,
        isCompleted: statusState.isCompleted
      });
      setIsLoading(false);
    }
  }, [statusState, statusIsLoading]);

  // Complete onboarding function that sets the step to "complete"
  const handleCompleteOnboarding = async () => {
    try {
      await completeOnboarding();
      
      // Force refresh status after completion
      await refreshStatus();
      
      return true;
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to complete onboarding");
      return false;
    }
  };

  return {
    state,
    isLoading: isLoading || statusIsLoading || isSubmitting,
    saveCurrentStep,
    completeOnboarding: handleCompleteOnboarding,
    goToNextStep,
    goToPreviousStep
  };
};
