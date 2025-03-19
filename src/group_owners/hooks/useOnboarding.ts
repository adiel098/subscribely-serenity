
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/contexts/AuthContext";

export type OnboardingStep = "welcome" | "connect-telegram" | "platform-plan" | "payment-method" | "complete";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  "welcome",
  "connect-telegram",
  "platform-plan",
  "payment-method",
  "complete"
];

interface OnboardingState {
  currentStep: OnboardingStep;
  isCompleted: boolean;
  isTelegramConnected: boolean;
  hasPlatformPlan: boolean;
  hasPaymentMethod: boolean;
}

export const useOnboarding = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<OnboardingState>({
    currentStep: "welcome",
    isCompleted: false,
    isTelegramConnected: false,
    hasPlatformPlan: false,
    hasPaymentMethod: false,
  });

  useEffect(() => {
    if (user) {
      fetchOnboardingStatus();
    }
  }, [user]);

  const fetchOnboardingStatus = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching onboarding status for user:", user?.id);
      // Fetch profile data to get onboarding status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed, onboarding_step')
        .eq('id', user?.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      console.log("Profile data:", profile);

      // Check if user has connected a Telegram group
      const { data: communities, error: communitiesError } = await supabase
        .from('communities')
        .select('id, telegram_chat_id')
        .eq('owner_id', user?.id);

      if (communitiesError) {
        console.error("Error fetching communities:", communitiesError);
        throw communitiesError;
      }

      console.log("Communities data:", communities);

      // Check if user has a platform subscription
      const { data: subscription, error: subscriptionError } = await supabase
        .from('platform_subscriptions')
        .select('id')
        .eq('owner_id', user?.id)
        .eq('status', 'active')
        .maybeSingle();

      if (subscriptionError) {
        console.error("Error fetching subscription:", subscriptionError);
        throw subscriptionError;
      }

      console.log("Subscription data:", subscription);

      // Check if user has set up payment methods
      const { data: paymentMethods, error: paymentMethodsError } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('owner_id', user?.id)
        .limit(1);

      if (paymentMethodsError) {
        console.error("Error fetching payment methods:", paymentMethodsError);
        throw paymentMethodsError;
      }

      console.log("Payment methods data:", paymentMethods);

      setState({
        currentStep: (profile?.onboarding_step as OnboardingStep) || "welcome",
        isCompleted: profile?.onboarding_completed || false,
        isTelegramConnected: communities && communities.length > 0 && communities.some(c => c.telegram_chat_id),
        hasPlatformPlan: !!subscription,
        hasPaymentMethod: paymentMethods && paymentMethods.length > 0
      });

      console.log("Onboarding state updated:", {
        currentStep: (profile?.onboarding_step as OnboardingStep) || "welcome",
        isCompleted: profile?.onboarding_completed || false,
        isTelegramConnected: communities && communities.length > 0 && communities.some(c => c.telegram_chat_id),
        hasPlatformPlan: !!subscription,
        hasPaymentMethod: paymentMethods && paymentMethods.length > 0
      });
    } catch (error) {
      console.error("Error fetching onboarding status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your onboarding status"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveCurrentStep = async (step: OnboardingStep) => {
    try {
      console.log("Saving current step:", step);
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_step: step })
        .eq('id', user?.id);

      if (error) {
        console.error("Error saving step:", error);
        throw error;
      }

      setState(prev => ({ ...prev, currentStep: step }));
      console.log("Step saved successfully");
    } catch (error) {
      console.error("Error saving onboarding step:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your progress"
      });
    }
  };

  const completeOnboarding = async (): Promise<void> => {
    try {
      console.log("Completing onboarding for user:", user?.id);
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_step: "complete"
        })
        .eq('id', user?.id);

      if (error) {
        console.error("Error completing onboarding:", error);
        throw error;
      }

      console.log("Onboarding completed successfully");
      setState(prev => ({ 
        ...prev, 
        isCompleted: true,
        currentStep: "complete"
      }));
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete onboarding"
      });
      throw error; // Re-throw the error to handle it in the component
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
    state,
    isLoading,
    goToNextStep,
    goToPreviousStep,
    saveCurrentStep,
    completeOnboarding,
    refreshStatus: fetchOnboardingStatus
  };
};
