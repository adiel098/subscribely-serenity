
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { OnboardingStep } from "./types";

// Map onboarding steps to URLs
const stepToPathMap: Record<OnboardingStep, string> = {
  "welcome": "/onboarding/welcome",
  "project-creation": "/onboarding/project-creation", 
  "custom-bot-setup": "/onboarding/custom-bot-setup",
  "completion": "/onboarding/completion",
  "complete": "/dashboard",
};

// Map URL paths to onboarding steps
const pathToStepMap: Record<string, OnboardingStep> = {
  "/onboarding/welcome": "welcome",
  "/onboarding/project-creation": "project-creation",
  "/onboarding/custom-bot-setup": "custom-bot-setup",
  "/onboarding/completion": "completion",
  "/dashboard": "complete",
};

export const useOnboardingRouter = (
  onboardingState: { currentStep: OnboardingStep; isCompleted: boolean },
  isLoading: boolean,
  saveCurrentStep: (step: OnboardingStep) => Promise<void>
) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isUrlProcessed, setIsUrlProcessed] = useState(false);

  // Sync URL with onboarding state
  useEffect(() => {
    if (isLoading) return;

    const pathStep = location.pathname;
    const currentPathStep = pathToStepMap[pathStep];
    
    console.log("Onboarding Router Check:", {
      currentPathStep,
      onboardingStateStep: onboardingState.currentStep,
      isCompleted: onboardingState.isCompleted,
      pathname: location.pathname
    });

    // Handle completed onboarding
    if (onboardingState.isCompleted && !pathStep.includes('/dashboard')) {
      console.log("Onboarding is complete, redirecting to dashboard");
      navigate('/dashboard', { replace: true });
      return;
    }

    // If not on an onboarding path, don't process
    if (!pathStep.startsWith('/onboarding') && pathStep !== '/dashboard') {
      console.log("Not on onboarding path, skipping router logic");
      setIsUrlProcessed(true);
      return;
    }

    // If URL doesn't match a known onboarding step, redirect to correct step
    if (!currentPathStep && pathStep.startsWith('/onboarding')) {
      console.log(`Unknown onboarding path: ${pathStep}, redirecting to current step: ${onboardingState.currentStep}`);
      navigate(stepToPathMap[onboardingState.currentStep], { replace: true });
      return;
    }

    // If URL step and state step don't match, update the state to match URL
    if (currentPathStep && currentPathStep !== onboardingState.currentStep) {
      console.log(`URL step (${currentPathStep}) differs from state step (${onboardingState.currentStep}). Updating state.`);
      saveCurrentStep(currentPathStep).then(() => {
        setIsUrlProcessed(true);
      });
    } else {
      setIsUrlProcessed(true);
    }
  }, [onboardingState.currentStep, onboardingState.isCompleted, isLoading, location.pathname, navigate, saveCurrentStep]);

  return { isLoading, isUrlProcessed };
};
