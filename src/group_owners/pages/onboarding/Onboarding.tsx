
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
    }
  }, [location.pathname, navigate]);

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
          
          if (profile.onboarding_step && profile.onboarding_step !== currentStep) {
            console.log("Setting step from profile:", profile.onboarding_step);
            setCurrentStep(profile.onboarding_step as OnboardingStep);
            
            // Update URL to match the current step
            navigate(`/onboarding/${profile.onboarding_step}`, { replace: true });
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
  }, [user, currentStep, navigate, toast]);

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
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <h1 className="text-2xl font-bold mb-4">Step not found</h1>
            <p className="mb-4">We couldn't find the onboarding step you're looking for.</p>
            <button 
              onClick={() => navigate('/onboarding/welcome', { replace: true })}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
              Go to Start
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {renderCurrentStep()}
    </div>
  );
};

export default Onboarding;
