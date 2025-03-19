
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingStep } from "@/group_owners/hooks/onboarding/types";
import { useOnboardingNavigation } from "@/group_owners/hooks/onboarding/useOnboardingNavigation";
import { WelcomeStep } from "./steps/WelcomeStep";
import ConnectTelegramStep from "./steps/ConnectTelegramStep";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUrlProcessed, setIsUrlProcessed] = useState(false);

  const { 
    saveCurrentStep, 
    goToNextStep, 
    goToPreviousStep,
    completeOnboarding,
    isSubmitting
  } = useOnboardingNavigation(currentStep, setCurrentStep, setIsCompleted);

  // Determine which step to show based on URL path - only once on initial load
  useEffect(() => {
    if (isUrlProcessed) return;
    
    console.log("Processing URL path:", location.pathname);
    const path = location.pathname;
    
    if (path.includes('/onboarding/welcome')) {
      setCurrentStep('welcome');
    } else if (path.includes('/onboarding/connect-telegram')) {
      setCurrentStep('connect-telegram');
    } else if (path.includes('/onboarding/complete')) {
      setCurrentStep('complete');
    } else if (path === '/onboarding' || path === '/onboarding/') {
      // Default to welcome step if just on /onboarding
      navigate('/onboarding/welcome', { replace: true });
    } else {
      // Handle unknown paths - redirect to welcome step
      console.error("Unknown step in path:", path);
      navigate('/onboarding/welcome', { replace: true });
    }
    
    setIsUrlProcessed(true);
  }, [location.pathname, navigate]);

  // Fetch onboarding state - only once
  useEffect(() => {
    if (!user || !isUrlProcessed) return;
    
    const fetchOnboardingState = async () => {
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
          
          // Only use step if it's a valid OnboardingStep and different from current
          if (profile.onboarding_step && 
              ["welcome", "connect-telegram", "complete"].includes(profile.onboarding_step) && 
              profile.onboarding_step !== currentStep && 
              !location.pathname.includes(profile.onboarding_step)) {
            console.log("Setting step from profile:", profile.onboarding_step);
            setCurrentStep(profile.onboarding_step as OnboardingStep);
            
            // Update URL to match the current step
            navigate(`/onboarding/${profile.onboarding_step}`, { replace: true });
          } else if (profile.onboarding_step && !["welcome", "connect-telegram", "complete"].includes(profile.onboarding_step)) {
            // Invalid step stored in profile, set to welcome
            console.warn("Invalid step in profile:", profile.onboarding_step);
            saveCurrentStep("welcome");
          }
        }
      } catch (error) {
        console.error("Error fetching onboarding state:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your onboarding progress"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOnboardingState();
  }, [user, isUrlProcessed, currentStep, navigate, toast, saveCurrentStep, location.pathname]);

  // Handle completion redirect - only when isCompleted changes
  useEffect(() => {
    if (isCompleted && !isLoading) {
      // Redirect to dashboard if onboarding is complete
      navigate('/dashboard', { replace: true });
    }
  }, [isCompleted, isLoading, navigate]);

  // Handle URL updates when currentStep changes
  useEffect(() => {
    if (isUrlProcessed && !location.pathname.includes(currentStep) && !isSubmitting) {
      console.log(`Updating URL to match current step: ${currentStep}`);
      navigate(`/onboarding/${currentStep}`, { replace: true });
    }
  }, [currentStep, navigate, location.pathname, isUrlProcessed, isSubmitting]);

  const handleCompleteOnboarding = async () => {
    try {
      await completeOnboarding();
      // The redirect will happen via the useEffect that watches isCompleted
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  if (isLoading || isSubmitting) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full bg-gradient-to-b from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-indigo-800 font-medium">Loading your onboarding progress...</p>
        </div>
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
            onComplete={handleCompleteOnboarding} 
            activeStep={true}
            goToPreviousStep={() => goToPreviousStep('connect-telegram')}
          />
        );
      
      case "complete":
        // Redirect to dashboard via useEffect when completed
        return null;
      
      default:
        console.error("Unknown step:", currentStep);
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
