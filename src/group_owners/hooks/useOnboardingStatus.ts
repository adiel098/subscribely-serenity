import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { createLogger } from "@/utils/debugUtils";

const logger = createLogger("useOnboardingStatus");

export const useOnboardingStatus = () => {
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkOnboardingStatus = async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }
      
      if (!user) {
        return false; // No user, can't check onboarding
      }
      
      // Get user profile data
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('onboarding_completed, onboarding_step')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        throw profileError;
      }
      
      logger.log("Onboarding status check:", profile);
      
      if (!profile) {
        return true; // No profile means onboarding needed
      }
      
      // If onboarding is explicitly completed, return false (no need for onboarding)
      if (profile.onboarding_completed === true) {
        return false;
      }
      
      // Otherwise, onboarding is needed
      return true;
    } catch (err) {
      logger.error("Error checking onboarding status:", err);
      if (err instanceof Error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
      }
      return false; // Default to not requiring onboarding on error
    } finally {
      setIsChecking(false);
    }
  };

  const updateOnboardingStep = async (step: string): Promise<void> => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ onboarding_step: step })
        .eq('id', user.id);
        
      if (updateError) {
        throw updateError;
      }
      
      logger.log("Updated onboarding step to:", step);
    } catch (err) {
      logger.error("Error updating onboarding step:", err);
      if (err instanceof Error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
      }
      throw err;
    }
  };

  const completeOnboarding = async (): Promise<void> => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          onboarding_completed: true,
          onboarding_step: 'completed'
        })
        .eq('id', user.id);
        
      if (updateError) {
        throw updateError;
      }
      
      logger.log("Onboarding completed");
      toast({
        title: "Success",
        description: "Onboarding completed successfully!",
      });
    } catch (err) {
      logger.error("Error completing onboarding:", err);
      if (err instanceof Error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
      }
      throw err;
    }
  };

  return {
    checkOnboardingStatus,
    updateOnboardingStep,
    completeOnboarding,
    isChecking
  };
};
