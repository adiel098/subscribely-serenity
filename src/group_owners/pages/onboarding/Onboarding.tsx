
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { useOnboarding } from "@/group_owners/hooks/useOnboarding";
import { useOnboardingRouter } from "@/group_owners/hooks/onboarding/useOnboardingRouter";
import { StepRenderer } from "@/group_owners/components/onboarding/StepRenderer";
import { OnboardingLoading } from "@/group_owners/components/onboarding/OnboardingLoading";
import OfficialBotSetupStep from "./steps/OfficialBotSetupStep";

const Onboarding = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const { 
    state: onboardingState, 
    isLoading: onboardingHookLoading, 
    goToNextStep, 
    goToPreviousStep,
    completeOnboarding,
    saveCurrentStep
  } = useOnboarding();

  const {
    isLoading,
    isUrlProcessed,
    handleOfficialBotSetup
  } = useOnboardingRouter(onboardingState, onboardingHookLoading, saveCurrentStep);

  const handleCompleteOnboarding = async () => {
    try {
      await completeOnboarding();
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  // Extract the current path step
  const pathStep = location.pathname.split('/').pop();

  // Special case for official-bot-setup - redirect to connect-telegram
  if (pathStep === 'official-bot-setup') {
    return handleOfficialBotSetup();
  }

  if (isLoading || onboardingHookLoading || !isUrlProcessed) {
    return <OnboardingLoading />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-indigo-50">
      <StepRenderer 
        currentStep={onboardingState.currentStep}
        pathStep={pathStep}
        goToNextStep={goToNextStep}
        goToPreviousStep={goToPreviousStep}
        handleCompleteOnboarding={handleCompleteOnboarding}
      />
    </div>
  );
};

export default Onboarding;
