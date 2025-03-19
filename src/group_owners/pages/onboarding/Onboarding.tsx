
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

  const { 
    saveCurrentStep, 
    goToNextStep, 
    goToPreviousStep,
    completeOnboarding
  } = useOnboardingNavigation(currentStep, setCurrentStep, setIsCompleted);

  // Determine which step to show based on URL path
  useEffect(() => {
    console.log("Current path:", location.pathname);
    const path = location.pathname;
    
    if (path.includes('/onboarding/welcome')) {
      setCurrentStep('welcome');
    } else if (path.includes('/onboarding/connect-telegram')) {
      setCurrentStep('connect-telegram');
    } else if (path.includes('/onboarding/complete')) {
      setCurrentStep('complete');
      // Complete onboarding and redirect to dashboard
      if (user) {
        completeOnboarding().then(() => {
          navigate('/dashboard', { replace: true });
        }).catch(err => {
          console.error("Error completing onboarding:", err);
        });
      }
    } else if (path === '/onboarding' || path === '/onboarding/') {
      // Default to welcome step if just on /onboarding
      setCurrentStep('welcome');
      // Update the URL to show the welcome step
      navigate('/onboarding/welcome', { replace: true });
    } else {
      // Handle unknown paths - redirect to welcome step
      console.error("Unknown step in path:", path);
      setCurrentStep('welcome');
      navigate('/onboarding/welcome', { replace: true });
    }
  }, [location.pathname, navigate, user, completeOnboarding]);

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
          
          // Only use step if it's a valid OnboardingStep
          if (profile.onboarding_step && 
              ["welcome", "connect-telegram", "complete"].includes(profile.onboarding_step) && 
              profile.onboarding_step !== currentStep) {
            console.log("Setting step from profile:", profile.onboarding_step);
            setCurrentStep(profile.onboarding_step as OnboardingStep);
            
            // Update URL to match the current step
            navigate(`/onboarding/${profile.onboarding_step}`, { replace: true });
          } else if (profile.onboarding_step && !["welcome", "connect-telegram", "complete"].includes(profile.onboarding_step)) {
            // Invalid step stored in profile, set to welcome
            console.warn("Invalid step in profile:", profile.onboarding_step);
            saveCurrentStep("welcome");
            navigate('/onboarding/welcome', { replace: true });
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
  }, [user, currentStep, navigate, toast, saveCurrentStep]);

  useEffect(() => {
    if (isCompleted && !isLoading) {
      // Redirect to dashboard if onboarding is complete
      navigate('/dashboard');
    }
  }, [isCompleted, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full bg-gradient-to-b from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-indigo-800 font-medium">Loading your onboarding progress...</p>
        </div>
      </div>
    );
  }

  const handleCompleteOnboarding = async () => {
    try {
      await completeOnboarding();
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

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
