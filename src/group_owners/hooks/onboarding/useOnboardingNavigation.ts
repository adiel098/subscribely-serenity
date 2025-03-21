
import { useState, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/auth/contexts/AuthContext";
import { OnboardingStep, ONBOARDING_STEPS } from "./types";
import { saveOnboardingStep, completeOnboardingProcess } from "../../services/onboardingService";

export const useOnboardingNavigation = (
  currentStep: OnboardingStep,
  setCurrentStep: (step: OnboardingStep) => void,
  setIsCompleted: (completed: boolean) => void
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSavedStepRef = useRef<OnboardingStep | null>(null);

  // Allow any step string to be passed, but save only valid OnboardingStep values
  const saveCurrentStep = useCallback(async (step: string) => {
    if (!user) return;
    
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
      if (["welcome", "connect-telegram", "complete"].includes(step)) {
        validStep = step as OnboardingStep;
      } else {
        console.warn(`Invalid step "${step}" provided, defaulting to "welcome"`);
      }
      
      await saveOnboardingStep(user.id, validStep);
      setCurrentStep(validStep);
      lastSavedStepRef.current = validStep;
      
      console.log("Step saved successfully");
    } catch (error) {
      console.error("Error saving onboarding step:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your progress"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [user, setCurrentStep, toast]);

  const completeOnboarding = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    try {
      console.log("Completing onboarding for user:", user.id);
      setIsSubmitting(true);
      
      await completeOnboardingProcess(user.id);
      
      console.log("Onboarding completed successfully");
      setCurrentStep("complete");
      setIsCompleted(true);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete onboarding"
      });
      throw error; // Re-throw the error to handle it in the component
    } finally {
      setIsSubmitting(false);
    }
  }, [user, setCurrentStep, setIsCompleted, toast]);

  const goToNextStep = useCallback((currentStep: OnboardingStep = "welcome") => {
    if (!user) return;
    
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    const nextStep = ONBOARDING_STEPS[currentIndex + 1];
    
    if (nextStep) {
      console.log("Moving to next step:", nextStep);
      if (nextStep !== lastSavedStepRef.current) {
        saveCurrentStep(nextStep);
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
