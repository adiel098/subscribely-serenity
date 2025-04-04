
import React from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingStep } from "@/group_owners/hooks/onboarding/types";
import { WelcomeStep } from "@/group_owners/pages/onboarding/steps/WelcomeStep";
import BotSelectionStep from "@/group_owners/pages/onboarding/steps/BotSelectionStep";
import CustomBotSetupStep from "@/group_owners/pages/onboarding/steps/CustomBotSetupStep";
import ConnectTelegramStep from "@/group_owners/pages/onboarding/steps/ConnectTelegramStep";
import CompletionStep from "@/group_owners/pages/onboarding/steps/CompletionStep";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  // Handle the "complete" step explicitly with useEffect
  React.useEffect(() => {
    if (currentStep === "complete" && !isRedirecting) {
      console.log("Onboarding complete in StepRenderer, preparing redirect to dashboard...");
      setIsRedirecting(true);
      
      // Use a slight delay to allow React to finish its current render cycle
      const redirectTimer = setTimeout(() => {
        console.log("Executing dashboard redirect...");
        navigate('/dashboard', { replace: true });
      }, 300); // Increased timeout to ensure all state updates complete
      
      return () => clearTimeout(redirectTimer);
    }
  }, [currentStep, navigate, isRedirecting]);
  
  // If we're redirecting or step is complete, show loading state
  if (isRedirecting && currentStep !== "completion") {
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
          handleCompleteOnboarding();
        }} 
        activeStep={true}
        goToPreviousStep={() => navigate('/onboarding/bot-selection')}
      />
    );
  }
  
  const handleWelcomeComplete = () => {
    console.log("Welcome step completed, going to next step");
    // Use direct navigation to ensure we move to the next step
    goToNextStep("welcome");
    
    // Add a direct navigation fallback
    setTimeout(() => {
      navigate('/onboarding/bot-selection');
    }, 300);
  };
  
  switch(currentStep) {
    case "welcome":
      return (
        <WelcomeStep 
          onComplete={handleWelcomeComplete} 
          activeStep={true}
        />
      );
    
    case "bot-selection":
      return (
        <BotSelectionStep 
          onComplete={() => {
            console.log("Bot selection completed, going to next step");
            goToNextStep("bot-selection");
          }} 
          activeStep={true}
          goToPreviousStep={() => {
            console.log("Going back to welcome step");
            goToPreviousStep("welcome");
            navigate('/onboarding/welcome');
          }}
        />
      );
      
    case "custom-bot-setup":
      return (
        <CustomBotSetupStep 
          onComplete={() => handleCompleteOnboarding()} 
          activeStep={true}
          goToPreviousStep={() => {
            console.log("Going back to bot selection step");
            goToPreviousStep("bot-selection");
            navigate('/onboarding/bot-selection');
          }}
        />
      );
    
    case "connect-telegram":
      return (
        <ConnectTelegramStep 
          onComplete={() => {
            console.log("Connect telegram completed, going to completion step");
            goToNextStep("connect-telegram");
            navigate('/onboarding/completion');
          }}
          activeStep={true}
          goToPreviousStep={() => {
            // Check if we need to go back to custom-bot-setup or bot-selection
            const hasBotToken = async () => {
              try {
                const { data } = await supabase
                  .from('bot_settings')
                  .select('custom_bot_token')
                  .single();
                
                if (data?.custom_bot_token) {
                  console.log("Has bot token, going back to custom-bot-setup");
                  navigate('/onboarding/custom-bot-setup');
                } else {
                  console.log("No bot token, going back to bot-selection");
                  navigate('/onboarding/bot-selection');
                }
              } catch (error) {
                console.error("Error checking bot token:", error);
                toast.error("Failed to check previous step");
                navigate('/onboarding/bot-selection');
              }
            };
            
            hasBotToken();
          }}
        />
      );
    
    case "completion":
      return (
        <CompletionStep
          onComplete={handleCompleteOnboarding}
          activeStep={true}
          goToPreviousStep={() => {
            console.log("Going back to connect telegram step");
            goToPreviousStep("completion");
            navigate('/onboarding/connect-telegram');
          }}
        />
      );
      
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
