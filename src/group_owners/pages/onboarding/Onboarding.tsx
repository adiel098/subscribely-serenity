
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingStep } from "@/group_owners/hooks/onboarding/types";
import { useOnboardingNavigation } from "@/group_owners/hooks/onboarding/useOnboardingNavigation";
import { WelcomeStep } from "./steps/WelcomeStep";
import ConnectTelegramStep from "./steps/ConnectTelegramStep";
import CreatePlansStep from "./steps/CreatePlansStep";
import { PaymentMethodStep } from "./steps/PaymentMethodStep";
import CompletionStep from "./steps/CompletionStep";
import { Loader2 } from "lucide-react";

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { 
    saveCurrentStep, 
    goToNextStep, 
    goToPreviousStep,
    completeOnboarding
  } = useOnboardingNavigation(currentStep, setCurrentStep, setIsCompleted);

  // Determine which step to show based on URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/onboarding/connect-telegram')) {
      setCurrentStep('connect-telegram');
    } else if (path.includes('/onboarding/create-plans')) {
      setCurrentStep('create-plans');
    } else if (path.includes('/onboarding/payment-method')) {
      setCurrentStep('payment-method');
    } else if (path.includes('/onboarding/complete')) {
      setCurrentStep('complete');
    } else {
      setCurrentStep('welcome');
    }
  }, [location.pathname]);

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
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const renderCurrentStep = () => {
    console.log("Rendering current step:", currentStep);
    
    switch(currentStep) {
      case "welcome":
        return (
          <WelcomeStep 
            onComplete={() => goToNextStep('welcome')} 
            activeStep={true}
          />
        );
      
      case "connect-telegram":
        return (
          <ConnectTelegramStep 
            onComplete={() => goToNextStep('connect-telegram')} 
            activeStep={true}
            goToPreviousStep={() => goToPreviousStep('connect-telegram')}
          />
        );
      
      case "create-plans":
        return (
          <CreatePlansStep 
            goToNextStep={() => goToNextStep('create-plans')} 
            goToPreviousStep={() => goToPreviousStep('create-plans')}
            saveCurrentStep={saveCurrentStep}
          />
        );
      
      case "payment-method":
        return (
          <PaymentMethodStep 
            goToNextStep={() => goToNextStep('payment-method')} 
            goToPreviousStep={() => goToPreviousStep('payment-method')}
            saveCurrentStep={saveCurrentStep}
            hasPaymentMethod={hasPaymentMethod}
          />
        );
      
      case "complete":
        return (
          <CompletionStep 
            onComplete={completeOnboarding} 
            activeStep={true}
            goToPreviousStep={() => goToPreviousStep('complete')}
          />
        );
      
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {renderCurrentStep()}
    </div>
  );
};

export default Onboarding;
