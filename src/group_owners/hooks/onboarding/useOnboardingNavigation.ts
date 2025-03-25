import { useState, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/auth/contexts/AuthContext";
import { OnboardingStep, ONBOARDING_STEPS } from "./types";
import { saveOnboardingStep, completeOnboardingProcess } from "../../services/onboardingService";
import { toast } from "sonner";

export const useOnboardingNavigation = (
  currentStep: OnboardingStep,
  setCurrentStep: (step: OnboardingStep) => void,
  setIsCompleted: (completed: boolean) => void
) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSavedStepRef = useRef<OnboardingStep | null>(null);
  const isCompletingRef = useRef(false);
  const completionInProgressRef = useRef(false);
  const hasCompletedRef = useRef(false);

  // Allow any step string to be passed, but save only valid OnboardingStep values
  const saveCurrentStep = useCallback(async (step: string) => {
    if (!user || hasCompletedRef.current) return;
    
    // Prevent duplicate save operations for the same step
    if (step === lastSavedStepRef.current) {
      console.log("Step already saved, skipping duplicate save:", step);
      return;
    }
    
    try {
      console.log("Saving current step:", step);
      setIsSubmitting(true);
      
      // Map any incoming step to a valid OnboardingStep
      let validStep: OnboardingStep = "welcome";
      
      // Only use the step if it's a valid OnboardingStep
      if (["welcome", "bot-selection", "custom-bot-setup", "connect-telegram", "completion", "complete"].includes(step)) {
        validStep = step as OnboardingStep;
      } else {
        console.warn(`Invalid step "${step}" provided, defaulting to "welcome"`);
      }
      
      await saveOnboardingStep(user.id, validStep);
      console.log("Setting current step to:", validStep);
      setCurrentStep(validStep);
      lastSavedStepRef.current = validStep;
      
      // If the step is "complete", also mark as completed
      if (validStep === "complete" && !isCompletingRef.current) {
        console.log("Step is 'complete', setting isCompleted to true");
        setIsCompleted(true);
        hasCompletedRef.current = true;
      }
      
      console.log("Step saved successfully");
    } catch (error) {
      console.error("Error saving onboarding step:", error);
      toast.error("Failed to save your progress");
    } finally {
      setIsSubmitting(false);
    }
  }, [user, setCurrentStep, setIsCompleted]);

  const completeOnboarding = useCallback(async (): Promise<void> => {
    if (!user || isCompletingRef.current || completionInProgressRef.current || hasCompletedRef.current) {
      console.log("Onboarding already completed or in progress, skipping");
      return Promise.resolve();
    }
    
    try {
      console.log("Completing onboarding for user:", user.id);
      isCompletingRef.current = true;
      completionInProgressRef.current = true;
      hasCompletedRef.current = true;
      setIsSubmitting(true);
      
      await completeOnboardingProcess(user.id);
      
      console.log("Onboarding completed successfully");
      
      // Set state variables to indicate completion
      // This should trigger the router to redirect to dashboard
      setCurrentStep("complete");
      setIsCompleted(true);

      console.log("Current step set to 'complete' and isCompleted set to true");
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to complete onboarding");
      completionInProgressRef.current = false;
      hasCompletedRef.current = false;
      return Promise.reject(error);
    } finally {
      setIsSubmitting(false);
      // Keep isCompletingRef true to prevent repeated completions
    }
  }, [user, setCurrentStep, setIsCompleted]);

  const goToNextStep = useCallback((currentStep: OnboardingStep = "welcome") => {
    if (!user) return;
    
    console.log("Current step in goToNextStep:", currentStep);
    console.log("All onboarding steps:", ONBOARDING_STEPS);
    
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    console.log("Current step index:", currentIndex);
    
    const nextStep = ONBOARDING_STEPS[currentIndex + 1];
    console.log("Next step calculated:", nextStep);
    
    if (nextStep) {
      console.log("Moving to next step:", nextStep);
      if (nextStep !== lastSavedStepRef.current) {
        saveCurrentStep(nextStep);
        
        // Add a direct navigation fallback using window.location for critical transitions
        if (currentStep === "welcome" && nextStep === "bot-selection") {
          console.log("Critical transition from welcome to bot-selection");
          setTimeout(() => {
            window.location.href = '/onboarding/bot-selection';
          }, 500);
        }
      } else {
        // Just update the UI without saving to the database
        setCurrentStep(nextStep);
      }
    } else {
      console.warn("No next step available from:", currentStep);
    }
  }, [user, saveCurrentStep, setCurrentStep]);

  const goToPreviousStep = useCallback((currentStep: OnboardingStep = "welcome") => {
    if (!user) return;
    
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    
    if (currentIndex > 0) {
      const previousStep = ONBOARDING_STEPS[currentIndex - 1];
      console.log("Moving to previous step:", previousStep);
      if (previousStep !== lastSavedStepRef.current) {
        saveCurrentStep(previousStep);
      } else {
        // Just update the UI without saving to the database
        setCurrentStep(previousStep);
      }
    } else {
      console.warn("No previous step available from:", currentStep);
    }
  }, [user, saveCurrentStep, setCurrentStep]);

  return {
    isSubmitting,
    saveCurrentStep,
    completeOnboarding,
    goToNextStep,
    goToPreviousStep
  };
};
