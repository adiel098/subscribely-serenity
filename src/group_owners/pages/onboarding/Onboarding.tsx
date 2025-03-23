
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingStep } from "@/group_owners/hooks/onboarding/types";
import { WelcomeStep } from "./steps/WelcomeStep";
import BotSelectionStep from "./steps/BotSelectionStep";
import ConnectTelegramStep from "./steps/ConnectTelegramStep";
import { useToast } from "@/components/ui/use-toast";
import { useOnboarding } from "@/group_owners/hooks/useOnboarding";
import { Loader2 } from "lucide-react";

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const initialLoadRef = useRef(true);
  const [isUrlProcessed, setIsUrlProcessed] = useState(false);
  
  // Use the centralized onboarding hook
  const { 
    state: onboardingState, 
    isLoading: onboardingHookLoading, 
    goToNextStep, 
    goToPreviousStep,
    completeOnboarding
  } = useOnboarding();

  // Check onboarding status on initial load
  useEffect(() => {
    const checkCompletionStatus = async () => {
      if (!user) return;
      
      try {
        // Check if onboarding is already complete
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed, onboarding_step')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        // If onboarding is complete, redirect to dashboard
        if (profile.onboarding_completed || profile.onboarding_step === 'complete') {
          console.log("Onboarding already complete, redirecting to dashboard");
          navigate('/dashboard', { replace: true });
          return;
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkCompletionStatus();
  }, [user, navigate]);

  // Determine which step to show based on URL path - only once on initial load
  useEffect(() => {
    if (!isUrlProcessed && initialLoadRef.current && !isLoading) {
      console.log("Processing URL path:", location.pathname);
      const path = location.pathname;
      
      // Default to welcome step if just on /onboarding
      if (path === '/onboarding' || path === '/onboarding/') {
        navigate('/onboarding/welcome', { replace: true });
      }
      
      setIsUrlProcessed(true);
      initialLoadRef.current = false;
    }
  }, [location.pathname, navigate, isUrlProcessed, isLoading]);

  // Handle completion redirect - only when isCompleted changes
  useEffect(() => {
    if (onboardingState.isCompleted && !onboardingHookLoading) {
      // Redirect to dashboard if onboarding is complete
      navigate('/dashboard', { replace: true });
    }
  }, [onboardingState.isCompleted, onboardingHookLoading, navigate]);

  // Handle URL updates when currentStep changes
  useEffect(() => {
    const currentPath = location.pathname;
    const targetPath = `/onboarding/${onboardingState.currentStep}`;
    
    // Only update URL if we've processed the initial URL and the path doesn't match current step
    if (
      isUrlProcessed && 
      !currentPath.includes(onboardingState.currentStep) && 
      !onboardingHookLoading &&
      !initialLoadRef.current &&
      !isLoading
    ) {
      console.log(`Updating URL to match current step: ${onboardingState.currentStep}`);
      navigate(targetPath, { replace: true });
    }
  }, [onboardingState.currentStep, navigate, location.pathname, isUrlProcessed, onboardingHookLoading, isLoading]);

  const handleCompleteOnboarding = async () => {
    try {
      await completeOnboarding();
      // The redirect will happen via the useEffect that watches isCompleted
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  if (isLoading || onboardingHookLoading || !isUrlProcessed) {
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
            onComplete={() => goToNextStep(onboardingState.currentStep)} 
            activeStep={true}
          />
        );
      
      case "bot-selection":
        return (
          <BotSelectionStep 
            onComplete={() => goToNextStep(onboardingState.currentStep)} 
            activeStep={true}
            goToPreviousStep={() => goToPreviousStep(onboardingState.currentStep)}
          />
        );
      
      case "connect-telegram":
        return (
          <ConnectTelegramStep 
            onComplete={handleCompleteOnboarding} 
            activeStep={true}
            goToPreviousStep={() => goToPreviousStep(onboardingState.currentStep)}
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
