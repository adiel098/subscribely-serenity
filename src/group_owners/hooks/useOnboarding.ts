
import { useState } from "react";
import { OnboardingStep, ONBOARDING_STEPS, OnboardingState } from "./onboarding/types";
import { useOnboardingStatus } from "./onboarding/useOnboardingStatus";
import { useOnboardingNavigation } from "./onboarding/useOnboardingNavigation";

// Use export type for re-exporting types when isolatedModules is enabled
export type { OnboardingStep, OnboardingState };
export { ONBOARDING_STEPS };

export const useOnboarding = () => {
  const { state, isLoading, refreshStatus } = useOnboardingStatus();
  
  // Create a setter function to update state locally with proper typing
  const [localState, setLocalState] = useState<OnboardingState>(state);
  
  // Create properly typed setter functions
  const setCurrentStep = (step: OnboardingStep) => {
    setLocalState(prev => ({ ...prev, currentStep: step }));
  };
  
  const setIsCompleted = (completed: boolean) => {
    setLocalState(prev => ({ ...prev, isCompleted: completed }));
  };
  
  const { 
    isSubmitting,
    saveCurrentStep, 
    completeOnboarding, 
    goToNextStep, 
    goToPreviousStep 
  } = useOnboardingNavigation(localState.currentStep, setCurrentStep, setIsCompleted);

  // Use the combined state (remote state from useOnboardingStatus and local updates)
  const combinedState = {
    ...state,
    currentStep: localState.currentStep,
    isCompleted: localState.isCompleted
  };

  return {
    state: combinedState,
    isLoading: isLoading || isSubmitting,
    saveCurrentStep,
    completeOnboarding,
    goToNextStep,
    goToPreviousStep,
    refreshStatus
  };
};
