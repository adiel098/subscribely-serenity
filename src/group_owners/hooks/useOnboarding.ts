
import { useState, useEffect, useCallback, useRef } from "react";
import { OnboardingStep, ONBOARDING_STEPS, OnboardingState } from "./onboarding/types";
import { useOnboardingStatus } from "./onboarding/useOnboardingStatus";
import { useOnboardingNavigation } from "./onboarding/useOnboardingNavigation";

// Use export type for re-exporting types when isolatedModules is enabled
export type { OnboardingStep, OnboardingState };
export { ONBOARDING_STEPS };

export const useOnboarding = () => {
  const { state: remoteState, isLoading: isRemoteLoading, refreshStatus } = useOnboardingStatus();
  const initialLoadDone = useRef(false);
  
  // Create a local state that starts with default values but will be updated with remote values
  const [localState, setLocalState] = useState<OnboardingState>({
    currentStep: "welcome",
    isCompleted: false,
    isTelegramConnected: false,
    hasPlatformPlan: false,
    hasPaymentMethod: false
  });
  
  // Sync remote state to local state once when loaded and prevent further auto-syncing
  useEffect(() => {
    if (!isRemoteLoading && remoteState && !initialLoadDone.current) {
      console.log("Syncing remote state to local:", remoteState);
      setLocalState(prevState => ({
        ...prevState,
        ...remoteState
      }));
      initialLoadDone.current = true;
    }
  }, [remoteState, isRemoteLoading]);
  
  // Create properly typed setter functions
  const setCurrentStep = useCallback((step: OnboardingStep) => {
    setLocalState(prev => ({ ...prev, currentStep: step }));
  }, []);
  
  const setIsCompleted = useCallback((completed: boolean) => {
    setLocalState(prev => ({ ...prev, isCompleted: completed }));
  }, []);
  
  const { 
    isSubmitting,
    saveCurrentStep, 
    completeOnboarding, 
    goToNextStep, 
    goToPreviousStep 
  } = useOnboardingNavigation(localState.currentStep, setCurrentStep, setIsCompleted);

  return {
    state: localState,
    isLoading: isRemoteLoading || isSubmitting,
    saveCurrentStep,
    completeOnboarding,
    goToNextStep,
    goToPreviousStep,
    refreshStatus
  };
};
