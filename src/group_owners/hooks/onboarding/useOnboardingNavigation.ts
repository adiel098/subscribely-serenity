
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingStep } from "./types";
import { localStorageService } from "@/utils/localStorageService";

export const useOnboardingNavigation = (
  currentStep: OnboardingStep,
  setCurrentStep: (step: OnboardingStep) => void,
  setIsCompleted: (completed: boolean) => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Save the current step to the database and localStorage
  const saveCurrentStep = useCallback(async (step: OnboardingStep): Promise<void> => {
    setIsSubmitting(true);
    try {
      console.log(`Saving current step: ${step}`);
      
      // Update the local state
      setCurrentStep(step);
      
      // Save to localStorage
      const status = localStorageService.getOnboardingStatus() || { isCompleted: false };
      localStorageService.setOnboardingStatus({
        ...status,
        lastStep: step,
        currentStep: step
      });
      
      // Save to database - updated to use 'users' table instead of 'profiles'
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase.from('users')
        .update({ 
          onboarding_step: step === "complete" ? "complete" : step,
          onboarding_completed: step === "complete" 
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Update completion status if step is "complete"
      if (step === "complete") {
        setIsCompleted(true);
      }
    } catch (error) {
      console.error("Error saving step:", error);
      toast.error("Failed to save your progress. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [setCurrentStep, setIsCompleted]);

  // Mark onboarding as complete
  const completeOnboarding = useCallback(async () => {
    setIsSubmitting(true);
    try {
      console.log("Completing onboarding");
      
      // Update local state
      setCurrentStep("complete");
      setIsCompleted(true);
      
      // Save to localStorage
      localStorageService.setOnboardingStatus({
        isCompleted: true,
        lastStep: "complete",
        currentStep: "complete"
      });
      
      // Save to database - updated to use 'users' table
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase.from('users')
        .update({ 
          onboarding_step: "complete",
          onboarding_completed: true 
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Also set has_community so user can access dashboard
      localStorageService.setHasCommunity(true);
      
      return true;
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to complete onboarding. Please try again.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [setCurrentStep, setIsCompleted]);

  // Navigation functions
  const goToNextStep = useCallback((currentStep: OnboardingStep) => {
    let nextStep: OnboardingStep;
    
    switch (currentStep) {
      case "welcome":
        nextStep = "project-creation";
        break;
      case "project-creation":
        nextStep = "custom-bot-setup";
        break;
      case "custom-bot-setup":
        // Skip connect-telegram and go directly to completion
        nextStep = "completion";
        break;
      case "completion":
        nextStep = "complete";
        break;
      default:
        // Default to the first step if we get an invalid step
        nextStep = "welcome";
    }
    
    console.log(`Going from ${currentStep} to next step: ${nextStep}`);
    return saveCurrentStep(nextStep);
  }, [saveCurrentStep]);

  const goToPreviousStep = useCallback((currentStep: OnboardingStep) => {
    let previousStep: OnboardingStep;
    
    switch (currentStep) {
      case "project-creation":
        previousStep = "welcome";
        break;
      case "custom-bot-setup":
        previousStep = "project-creation";
        break;
      case "completion":
        // Go directly back to custom-bot-setup, skipping connect-telegram
        previousStep = "custom-bot-setup";
        break;
      default:
        // Default to the welcome step if we get an invalid step
        previousStep = "welcome";
    }
    
    console.log(`Going from ${currentStep} to previous step: ${previousStep}`);
    return saveCurrentStep(previousStep);
  }, [saveCurrentStep]);

  return {
    isSubmitting,
    saveCurrentStep,
    completeOnboarding,
    goToNextStep,
    goToPreviousStep
  };
};
