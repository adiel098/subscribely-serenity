
import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { useOnboarding } from "@/group_owners/hooks/useOnboarding";
import { useOnboardingRouter } from "@/group_owners/hooks/onboarding/useOnboardingRouter";
import { StepRenderer } from "@/group_owners/components/onboarding/StepRenderer";
import { OnboardingLoading } from "@/group_owners/components/onboarding/OnboardingLoading";
import OfficialBotSetupStep from "./steps/OfficialBotSetupStep";

const Onboarding = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectingRef = useRef(false);
  
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
    if (redirectingRef.current) return;
    
    try {
      console.log("Handling complete onboarding...");
      redirectingRef.current = true;
      await completeOnboarding();
      
      // Use setTimeout to prevent React errors with navigation during renders
      setTimeout(() => {
        console.log("Navigation to dashboard after completion");
        navigate('/dashboard', { replace: true });
      }, 200);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      redirectingRef.current = false;
    }
  };

  useEffect(() => {
    // If onboarding is complete, redirect to the dashboard
    if (!onboardingHookLoading && onboardingState.isCompleted && !redirectingRef.current) {
      console.log("Onboarding detected as complete in main component, redirecting");
      redirectingRef.current = true;
      
      // Use setTimeout to prevent React errors with navigation during renders
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 200);
    }
  }, [onboardingState.isCompleted, onboardingHookLoading, navigate]);

  // Extract the current path step
  const pathStep = location.pathname.split('/').pop();

  // Special case for official-bot-setup - redirect to connect-telegram
  if (pathStep === 'official-bot-setup') {
    return handleOfficialBotSetup();
  }

  // Special case for complete step - redirect to dashboard
  if (pathStep === 'complete' || onboardingState.currentStep === 'complete') {
    if (!redirectingRef.current) {
      console.log("Complete step detected, redirecting to dashboard");
      redirectingRef.current = true;
      
      // Use setTimeout to prevent React errors with navigation during renders
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 200);
    }
    
    // Show loading while redirect happens
    return <OnboardingLoading />;
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
