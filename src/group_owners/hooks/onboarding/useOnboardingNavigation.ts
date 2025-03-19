
import { useState } from "react";
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

  const saveCurrentStep = async (step: OnboardingStep) => {
    if (!user) return;
    
    try {
      console.log("Saving current step:", step);
      setIsSubmitting(true);
      
      await saveOnboardingStep(user.id, step);
      setCurrentStep(step);
      
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
  };

  const completeOnboarding = async (): Promise<void> => {
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
  };

  const goToNextStep = (currentStep: OnboardingStep) => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    const nextStep = ONBOARDING_STEPS[currentIndex + 1];
    
    if (nextStep) {
      console.log("Moving to next step:", nextStep);
      saveCurrentStep(nextStep);
    }
  };

  const goToPreviousStep = (currentStep: OnboardingStep) => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    
    if (currentIndex > 0) {
      const previousStep = ONBOARDING_STEPS[currentIndex - 1];
      console.log("Moving to previous step:", previousStep);
      saveCurrentStep(previousStep);
    }
  };

  return {
    isSubmitting,
    saveCurrentStep,
    completeOnboarding,
    goToNextStep,
    goToPreviousStep
  };
};
