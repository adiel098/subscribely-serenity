
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingStep } from "@/group_owners/hooks/onboarding/types";
import { useOnboardingNavigation } from "@/group_owners/hooks/onboarding/useOnboardingNavigation";
import { WelcomeStep } from "./steps/WelcomeStep";
import ConnectTelegramStep from "./steps/ConnectTelegramStep";
import { useToast } from "@/components/ui/use-toast";
import { useOnboarding } from "@/group_owners/hooks/useOnboarding";
import { Loader2 } from "lucide-react";

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const initialLoadRef = useRef(true);
  const [isUrlProcessed, setIsUrlProcessed] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  // Use the centralized onboarding hook instead of local state
  const { 
    state: onboardingState, 
    isLoading, 
    goToNextStep, 
    goToPreviousStep,
    completeOnboarding
  } = useOnboarding();

  // Determine which step to show based on URL path - only once on initial load
  useEffect(() => {
    if (!isUrlProcessed && initialLoadRef.current) {
      console.log("Processing URL path:", location.pathname);
      const path = location.pathname;
      
      // Default to welcome step if just on /onboarding
      if (path === '/onboarding' || path === '/onboarding/') {
        navigate('/onboarding/welcome', { replace: true });
      }
      
      setIsUrlProcessed(true);
      initialLoadRef.current = false;
      
      // Short delay to ensure smooth UI rendering
      setTimeout(() => {
        setIsReady(true);
      }, 100);
    }
  }, [location.pathname, navigate, isUrlProcessed]);

  // Handle completion redirect - only when isCompleted changes
  useEffect(() => {
    if (onboardingState.isCompleted && !isLoading) {
      // Redirect to dashboard if onboarding is complete
      navigate('/dashboard', { replace: true });
    }
  }, [onboardingState.isCompleted, isLoading, navigate]);

  // Handle URL updates when currentStep changes - with circuit breaker to prevent infinite loops
  useEffect(() => {
    const currentPath = location.pathname;
    const targetPath = `/onboarding/${onboardingState.currentStep}`;
    
    // Only update URL if:
    // 1. We have processed the initial URL
    // 2. The current URL doesn't match the current step
    // 3. We're not submitting a change
    // 4. We're not in the initial load
    if (
      isUrlProcessed && 
      !currentPath.includes(onboardingState.currentStep) && 
      !isLoading &&
      !initialLoadRef.current
    ) {
      console.log(`Updating URL to match current step: ${onboardingState.currentStep}`);
      navigate(targetPath, { replace: true });
    }
  }, [onboardingState.currentStep, navigate, location.pathname, isUrlProcessed, isLoading]);

  const handleCompleteOnboarding = async () => {
    try {
      await completeOnboarding();
      // The redirect will happen via the useEffect that watches isCompleted
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  const renderCurrentStep = () => {
    console.log("Rendering current step:", onboardingState.currentStep);
    
    switch(onboardingState.currentStep) {
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
            onComplete={handleCompleteOnboarding} 
            activeStep={true}
            goToPreviousStep={() => goToPreviousStep('connect-telegram')}
          />
        );
      
      case "complete":
        // Redirect to dashboard via useEffect when completed
        return null;
      
      default:
        console.error("Unknown step:", onboardingState.currentStep);
        // Redirect to welcome step if we have an unknown step
        navigate('/onboarding/welcome', { replace: true });
        return (
          <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-blue-50 to-indigo-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 max-w-md w-full">
              <h1 className="text-2xl font-bold mb-4 text-gray-800">Step not found</h1>
              <p className="mb-6 text-gray-600">We couldn't find the onboarding step you're looking for.</p>
              <button 
                onClick={() => navigate('/onboarding/welcome', { replace: true })}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Go to Start
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-indigo-50">
      {renderCurrentStep()}
    </div>
  );
};

export default Onboarding;
