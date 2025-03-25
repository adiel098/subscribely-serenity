
import React from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingStep } from "@/group_owners/hooks/onboarding/types";
import { WelcomeStep } from "@/group_owners/pages/onboarding/steps/WelcomeStep";
import BotSelectionStep from "@/group_owners/pages/onboarding/steps/BotSelectionStep";
import CustomBotSetupStep from "@/group_owners/pages/onboarding/steps/CustomBotSetupStep";
import ConnectTelegramStep from "@/group_owners/pages/onboarding/steps/ConnectTelegramStep";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface StepRendererProps {
  currentStep: OnboardingStep;
  pathStep?: string | null;
  goToNextStep: (step: OnboardingStep) => void;
  goToPreviousStep: (step: OnboardingStep) => void;
  handleCompleteOnboarding: () => Promise<void>;
}

export const StepRenderer: React.FC<StepRendererProps> = ({
  currentStep,
  pathStep,
  goToNextStep,
  goToPreviousStep,
  handleCompleteOnboarding
}) => {
  const navigate = useNavigate();

  // Handle the "complete" step explicitly
  if (currentStep === "complete") {
    console.log("Onboarding complete, redirecting to dashboard...");
    // Redirect to dashboard immediately
    React.useEffect(() => {
      navigate('/dashboard', { replace: true });
    }, [navigate]);
    
    // Show loading state while redirecting
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-blue-50 to-indigo-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Setup Complete!</h1>
          <p className="mb-6 text-gray-600">Redirecting you to your dashboard...</p>
          <Loader2 className="animate-spin mx-auto h-8 w-8 text-indigo-600" />
        </div>
      </div>
    );
  }

  // Special case for custom-bot-setup
  if (pathStep === 'custom-bot-setup') {
    return (
      <CustomBotSetupStep 
        onComplete={() => {
          console.log("Custom bot setup completed, marking as complete...");
          // Update step to complete first
          goToNextStep("custom-bot-setup");
        }} 
        activeStep={true}
        goToPreviousStep={() => navigate('/onboarding/bot-selection')}
      />
    );
  }
  
  switch(currentStep) {
    case "welcome":
      return (
        <WelcomeStep 
          onComplete={() => goToNextStep(currentStep)} 
          activeStep={true}
        />
      );
    
    case "bot-selection":
      return (
        <BotSelectionStep 
          onComplete={() => {
            console.log("Bot selection completed, going to next step");
            goToNextStep(currentStep);
          }} 
          activeStep={true}
          goToPreviousStep={() => goToPreviousStep("welcome")}
        />
      );
      
    case "custom-bot-setup":
      return (
        <CustomBotSetupStep 
          onComplete={() => navigate('/dashboard')} 
          activeStep={true}
          goToPreviousStep={() => goToPreviousStep("bot-selection")}
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
      navigate('/dashboard');
      return null;
    
    default:
      console.error("Unknown step:", currentStep);
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
