
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
      // Fetch profile data to get onboarding status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed, onboarding_step')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;

      // Check if user has connected a Telegram group
      const { data: communities, error: communitiesError } = await supabase
        .from('communities')
        .select('id, telegram_chat_id')
        .eq('owner_id', user?.id);

      if (communitiesError) throw communitiesError;

      // Check if user has a platform subscription
      const { data: subscription, error: subscriptionError } = await supabase
        .from('platform_subscriptions')
        .select('id')
        .eq('owner_id', user?.id)
        .eq('status', 'active')
        .maybeSingle();

      if (subscriptionError) throw subscriptionError;

      // Check if user has set up payment methods
      const { data: paymentMethods, error: paymentMethodsError } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('owner_id', user?.id)
        .limit(1);

      if (paymentMethodsError) throw paymentMethodsError;

      setState({
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
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_step: step })
        .eq('id', user?.id);

      if (error) throw error;

      setState(prev => ({ ...prev, currentStep: step }));
    } catch (error) {
      console.error("Error saving onboarding step:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save your progress"
      });
    }
  };

  const completeOnboarding = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_step: "complete"
        })
        .eq('id', user?.id);

      if (error) throw error;

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
    }
  };

  const goToNextStep = (currentStep: OnboardingStep) => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    const nextStep = ONBOARDING_STEPS[currentIndex + 1];
    
    if (nextStep) {
      saveCurrentStep(nextStep);
    }
  };

  const goToPreviousStep = (currentStep: OnboardingStep) => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    
    if (currentIndex > 0) {
      const previousStep = ONBOARDING_STEPS[currentIndex - 1];
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
