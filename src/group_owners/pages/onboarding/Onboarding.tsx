
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingStep } from "@/group_owners/hooks/onboarding/types";
import { useOnboardingNavigation } from "@/group_owners/hooks/onboarding/useOnboardingNavigation";
import { WelcomeStep } from "./steps/WelcomeStep";
import ConnectTelegramStep from "./steps/ConnectTelegramStep";
import { PlatformPlanStep } from "./steps/PlatformPlanStep";
import CreatePlansStep from "./steps/CreatePlansStep";
import { PaymentMethodStep } from "./steps/PaymentMethodStep";
import CompletionStep from "./steps/CompletionStep";

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasPlatformPlan, setHasPlatformPlan] = useState(false);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { 
    saveCurrentStep, 
    goToNextStep, 
    goToPreviousStep,
    completeOnboarding
  } = useOnboardingNavigation(currentStep, setCurrentStep, setIsCompleted);

  // Fetch onboarding state
  useEffect(() => {
    const fetchOnboardingState = async () => {
      if (!user) return;
      
      try {
        // Get user profile to check onboarding status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_completed, onboarding_step')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        if (profile) {
          setIsCompleted(profile.onboarding_completed || false);
          
          if (profile.onboarding_step) {
            setCurrentStep(profile.onboarding_step as OnboardingStep);
          }
        }
        
        // Check if the user has a platform plan
        const { data: platformSubscription, error: subscriptionError } = await supabase
          .from('platform_subscriptions')
          .select('id')
          .eq('owner_id', user.id)
          .eq('status', 'active')
          .limit(1);
          
        if (subscriptionError) throw subscriptionError;
        
        setHasPlatformPlan(platformSubscription && platformSubscription.length > 0);

        // Check if user has payment methods
        const { data: paymentMethods, error: paymentMethodsError } = await supabase
          .from('payment_methods')
          .select('id')
          .eq('owner_id', user.id)
          .eq('is_active', true)
          .limit(1);

        if (paymentMethodsError) throw paymentMethodsError;
        
        setHasPaymentMethod(paymentMethods && paymentMethods.length > 0);
        
      } catch (error) {
        console.error("Error fetching onboarding state:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOnboardingState();
  }, [user]);

  useEffect(() => {
    if (isCompleted && !isLoading) {
      // Redirect to dashboard if onboarding is complete
      navigate('/dashboard');
    }
  }, [isCompleted, isLoading, navigate]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {currentStep === "welcome" && (
        <WelcomeStep 
          onComplete={() => goToNextStep('welcome')} 
          activeStep={currentStep === "welcome"}
        />
      )}
      
      {currentStep === "connect-telegram" && (
        <ConnectTelegramStep 
          onComplete={() => goToNextStep('connect-telegram')} 
          activeStep={currentStep === "connect-telegram"}
          goToPreviousStep={() => goToPreviousStep('connect-telegram')}
        />
      )}
      
      {currentStep === "platform-plan" && (
        <PlatformPlanStep 
          goToNextStep={() => goToNextStep('platform-plan')} 
          goToPreviousStep={() => goToPreviousStep('platform-plan')}
          hasPlatformPlan={hasPlatformPlan}
          saveCurrentStep={saveCurrentStep}
        />
      )}
      
      {currentStep === "create-plans" && (
        <CreatePlansStep 
          goToNextStep={() => goToNextStep('create-plans')} 
          goToPreviousStep={() => goToPreviousStep('create-plans')}
          saveCurrentStep={saveCurrentStep}
        />
      )}
      
      {currentStep === "payment-method" && (
        <PaymentMethodStep 
          goToNextStep={() => goToNextStep('payment-method')} 
          goToPreviousStep={() => goToPreviousStep('payment-method')}
          saveCurrentStep={saveCurrentStep}
          hasPaymentMethod={hasPaymentMethod}
        />
      )}
      
      {currentStep === "complete" && (
        <CompletionStep 
          onComplete={completeOnboarding} 
          activeStep={currentStep === "complete"}
          goToPreviousStep={() => goToPreviousStep('complete')}
        />
      )}
    </div>
  );
};

export default Onboarding;
