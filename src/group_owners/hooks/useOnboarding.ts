
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export type OnboardingStep = 'welcome' | 'connect-telegram' | 'platform-plan' | 'payment-method' | 'complete';

export const ONBOARDING_STEPS: OnboardingStep[] = [
  'welcome',
  'connect-telegram',
  'platform-plan',
  'payment-method',
  'complete'
];

export interface OnboardingState {
  currentStep: OnboardingStep;
  isTelegramConnected: boolean;
  hasPlatformPlan: boolean;
  hasPaymentMethod: boolean;
  isCompleted: boolean;
}

export const useOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<OnboardingState>({
    currentStep: 'welcome',
    isTelegramConnected: false,
    hasPlatformPlan: false,
    hasPaymentMethod: false,
    isCompleted: false
  });

  // Load onboarding state
  useEffect(() => {
    const loadOnboardingState = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        
        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed, onboarding_step')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        // Check if user has any communities (Telegram connected)
        const { data: communitiesData, error: communitiesError } = await supabase
          .from('communities')
          .select('id')
          .eq('owner_id', user.id)
          .limit(1);
          
        if (communitiesError) throw communitiesError;
        
        // Check if user has any platform subscriptions
        const { data: subscriptionsData, error: subscriptionsError } = await supabase
          .from('platform_subscriptions')
          .select('id')
          .eq('owner_id', user.id)
          .eq('status', 'active')
          .limit(1);
          
        if (subscriptionsError) throw subscriptionsError;
        
        // Check if user has any payment methods
        const { data: paymentMethodsData, error: paymentMethodsError } = await supabase
          .from('payment_methods')
          .select('id')
          .eq('owner_id', user.id)
          .eq('is_active', true)
          .limit(1);
          
        if (paymentMethodsError) throw paymentMethodsError;
        
        // Update state
        setState({
          currentStep: (profileData?.onboarding_step as OnboardingStep) || 'welcome',
          isTelegramConnected: communitiesData && communitiesData.length > 0,
          hasPlatformPlan: subscriptionsData && subscriptionsData.length > 0,
          hasPaymentMethod: paymentMethodsData && paymentMethodsData.length > 0,
          isCompleted: profileData?.onboarding_completed || false
        });
      } catch (error) {
        console.error('Error loading onboarding state:', error);
        toast({
          title: "Error loading onboarding data",
          description: "Please try refreshing the page.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOnboardingState();
  }, [user?.id, toast]);

  // Save current step to database
  const saveCurrentStep = async (step: OnboardingStep) => {
    if (!user?.id) return;
    
    try {
      await supabase
        .from('profiles')
        .update({
          onboarding_step: step
        })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error saving onboarding step:', error);
    }
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    if (!user?.id) return;
    
    try {
      await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_step: 'complete'
        })
        .eq('id', user.id);
        
      setState(prev => ({
        ...prev,
        isCompleted: true,
        currentStep: 'complete'
      }));
      
      toast({
        title: "Setup completed!",
        description: "Your account is now fully set up and ready to use.",
      });
      
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error saving setup progress",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  // Go to next step
  const goToNextStep = (currentStep: OnboardingStep) => {
    const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      const nextStep = ONBOARDING_STEPS[currentIndex + 1];
      saveCurrentStep(nextStep);
      setState(prev => ({ ...prev, currentStep: nextStep }));
      navigate(`/onboarding/${nextStep}`, { replace: true });
    }
  };

  return {
    state,
    isLoading,
    goToNextStep,
    saveCurrentStep,
    completeOnboarding
  };
};
