
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/auth/hooks/useAuth";
import { createLogger } from "@/utils/debugUtils";

const logger = createLogger("useOnboardingStatus");

/**
 * Hook to check and manage user onboarding status
 */
export const useOnboardingStatus = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<string | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  /**
   * Check if the user needs to complete onboarding
   * @returns {Promise<boolean>} True if user needs to complete onboarding
   */
  const checkOnboardingStatus = useCallback(async (): Promise<boolean> => {
    if (!user) {
      logger.warn("No authenticated user to check onboarding status");
      return false;
    }

    setIsLoading(true);
    logger.log(`Fetching onboarding status for user: ${user.id}`);

    try {
      const { data, error } = await supabase
        .from('users')
        .select('onboarding_completed, onboarding_step')
        .eq('id', user.id)
        .single();

      if (error) {
        logger.error("Error fetching onboarding status:", error);
        return false;
      }

      setOnboardingStep(data.onboarding_step || 'welcome');
      setOnboardingCompleted(data.onboarding_completed || false);

      logger.log(`User onboarding status: completed=${data.onboarding_completed}, step=${data.onboarding_step}`);
      return !data.onboarding_completed;
    } catch (error) {
      logger.error("Exception in checkOnboardingStatus:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Update the user's current onboarding step
   * @param {string} step The current step of onboarding
   * @returns {Promise<void>}
   */
  const updateOnboardingStep = useCallback(async (step: string): Promise<void> => {
    if (!user) return;

    logger.log(`Updating onboarding step to: ${step}`);
    const { error } = await supabase
      .from('users')
      .update({ onboarding_step: step })
      .eq('id', user.id);

    if (error) {
      logger.error("Error updating onboarding step:", error);
    }
  }, [user]);

  /**
   * Mark the onboarding process as complete
   * @returns {Promise<void>}
   */
  const completeOnboarding = useCallback(async (): Promise<void> => {
    if (!user) return;

    logger.log("Completing onboarding for user");
    const { error } = await supabase
      .from('users')
      .update({ 
        onboarding_completed: true,
        onboarding_step: 'completed' 
      })
      .eq('id', user.id);

    if (error) {
      logger.error("Error completing onboarding:", error);
    } else {
      setOnboardingCompleted(true);
    }
  }, [user]);

  return {
    isLoading,
    onboardingStep,
    onboardingCompleted,
    checkOnboardingStatus,
    updateOnboardingStep,
    completeOnboarding
  };
};
