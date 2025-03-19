
import { useState } from "react";
import { OnboardingStep, ONBOARDING_STEPS, OnboardingState } from "./onboarding/types";
import { useOnboardingStatus } from "./onboarding/useOnboardingStatus";
import { useOnboardingNavigation } from "./onboarding/useOnboardingNavigation";

export { OnboardingStep, ONBOARDING_STEPS };

export const useOnboarding = () => {
  const { state, isLoading, refreshStatus } = useOnboardingStatus();
  
  // Create a setter function to update state locally
  const setCurrentStep = (step: OnboardingStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };
  
  const setIsCompleted = (completed: boolean) => {
    setState(prev => ({ ...prev, isCompleted: completed }));
  };
  
  // Use this state to handle local updates
  const [setState] = useState<(prevState: OnboardingState) => OnboardingState>(prevState => prevState);
  
  const { 
    isSubmitting,
    saveCurrentStep, 
    completeOnboarding, 
    goToNextStep, 
    goToPreviousStep 
  } = useOnboardingNavigation(state.currentStep, setCurrentStep, setIsCompleted);

  return {
    state,
    isLoading: isLoading || isSubmitting,
    saveCurrentStep,
    completeOnboarding,
    goToNextStep,
    goToPreviousStep,
    refreshStatus
  };
};
