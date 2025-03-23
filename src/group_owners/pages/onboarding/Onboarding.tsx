import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingStep } from "@/group_owners/hooks/onboarding/types";
import { WelcomeStep } from "./steps/WelcomeStep";
import BotSelectionStep from "./steps/BotSelectionStep";
import ConnectTelegramStep from "./steps/ConnectTelegramStep";
import CustomBotSetupStep from "./steps/CustomBotSetupStep";
import OfficialBotSetupStep from "./steps/OfficialBotSetupStep";
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
  
  const { 
    state: onboardingState, 
    isLoading: onboardingHookLoading, 
    goToNextStep, 
    goToPreviousStep,
    completeOnboarding,
    saveCurrentStep
  } = useOnboarding();

  useEffect(() => {
    const checkCompletionStatus = async () => {
      if (!user) return;
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('onboarding_completed, onboarding_step')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
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

  useEffect(() => {
    if (!isUrlProcessed && initialLoadRef.current && !isLoading) {
      console.log("Processing URL path:", location.pathname);
      const path = location.pathname;
      
      if (path === '/onboarding' || path === '/onboarding/') {
        navigate('/onboarding/welcome', { replace: true });
      }
      
      setIsUrlProcessed(true);
      initialLoadRef.current = false;
    }
  }, [location.pathname, navigate, isUrlProcessed, isLoading]);

  useEffect(() => {
    if (onboardingState.isCompleted && !onboardingHookLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [onboardingState.isCompleted, onboardingHookLoading, navigate]);

  useEffect(() => {
    // Extract the current step from the URL path
    const currentPath = location.pathname;
    const pathStep = currentPath.split('/').pop();
    
    // If URL path contains a valid step and it's different from current state
    if (
      pathStep && 
      pathStep !== onboardingState.currentStep && 
      ["welcome", "bot-selection", "custom-bot-setup", "official-bot-setup", "connect-telegram", "complete"].includes(pathStep) &&
      !onboardingHookLoading &&
      !isLoading
    ) {
      console.log(`Updating step based on URL to: ${pathStep}`);
      saveCurrentStep(pathStep);
    }
  }, [location.pathname, onboardingState.currentStep, onboardingHookLoading, isLoading, saveCurrentStep]);

  const handleCompleteOnboarding = async () => {
    try {
      await completeOnboarding();
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
    
    // Extract the path to handle custom steps not tracked in onboardingState
    const path = location.pathname.split('/').pop();
    
    // Special case for official-bot-setup - redirect to connect-telegram
    if (path === 'official-bot-setup') {
      // Redirect to connect-telegram step
      console.log("Official bot setup detected, redirecting to connect-telegram");
      navigate('/onboarding/connect-telegram', { replace: true });
      return null;
    }
    
    // Special case for custom-bot-setup
    if (path === 'custom-bot-setup') {
      return (
        <CustomBotSetupStep 
          onComplete={() => goToNextStep("custom-bot-setup")} 
          activeStep={true}
          goToPreviousStep={() => navigate('/onboarding/bot-selection')}
        />
      );
    }
    
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
            onComplete={() => {
              console.log("Bot selection completed, going to next step");
              goToNextStep(onboardingState.currentStep);
            }} 
            activeStep={true}
            goToPreviousStep={() => goToPreviousStep(onboardingState.currentStep)}
          />
        );
        
      case "custom-bot-setup":
        return (
          <CustomBotSetupStep 
            onComplete={() => goToNextStep(onboardingState.currentStep)} 
            activeStep={true}
            goToPreviousStep={() => goToPreviousStep(onboardingState.currentStep)}
          />
        );
      
      case "official-bot-setup":
        return (
          <OfficialBotSetupStep 
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
            goToPreviousStep={() => {
              // Check if we need to go back to custom-bot-setup or bot-selection
              const hasBotToken = async () => {
                const { data } = await supabase
                  .from('bot_settings')
                  .select('custom_bot_token')
                  .single();
                
                if (data?.custom_bot_token) {
                  navigate('/onboarding/custom-bot-setup');
                } else {
                  navigate('/onboarding/bot-selection');
                }
              };
              
              hasBotToken();
            }}
          />
        );
      
      case "complete":
        return null;
      
      default:
        console.error("Unknown step:", onboardingState.currentStep);
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
