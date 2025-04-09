import React from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingStep } from "@/group_owners/hooks/onboarding/types";
import { WelcomeStep } from "@/group_owners/pages/onboarding/steps/WelcomeStep";
import ProjectCreationStep from "@/group_owners/pages/onboarding/steps/ProjectCreationStep";
import BotSetupStep from "@/group_owners/pages/onboarding/steps/BotSetupStep";
import BotSelectionStep from "@/group_owners/pages/onboarding/steps/BotSelectionStep";
import CustomBotSetupStep from "@/group_owners/pages/onboarding/steps/CustomBotSetupStep";
import ConnectTelegramStep from "@/group_owners/pages/onboarding/steps/ConnectTelegramStep";
import CompletionStep from "@/group_owners/pages/onboarding/steps/CompletionStep";
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
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  React.useEffect(() => {
    if (currentStep === "complete" && !isRedirecting) {
      console.log("Onboarding complete in StepRenderer, preparing redirect to dashboard...");
      setIsRedirecting(true);
      
      const redirectTimer = setTimeout(() => {
        console.log("Executing dashboard redirect...");
        navigate('/dashboard', { replace: true });
      }, 300);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [currentStep, navigate, isRedirecting]);
  
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

  const handleWelcomeComplete = () => {
    console.log("Welcome step completed, going to project creation step");
    navigate('/onboarding/project-creation');
    goToNextStep("welcome");
  };
  
  const handleProjectCreationComplete = () => {
    console.log("Project creation completed, going to bot selection step");
    navigate('/onboarding/bot-selection');
    goToNextStep("project-creation");
  };
  
  const handleBotSelectionComplete = () => {
    console.log("Bot selection completed, going to bot setup step");
    navigate('/onboarding/bot-setup');
    goToNextStep("bot-selection");
  };

  const handleBotSetupComplete = () => {
    console.log("Bot setup completed, going to connect telegram step");
    navigate('/onboarding/connect-telegram');
    goToNextStep("bot-setup");
  };
  
  const handleCustomBotSetupComplete = () => {
    console.log("Custom bot setup completed, going to connect telegram step");
    navigate('/onboarding/connect-telegram');
    goToNextStep("custom-bot-setup");
  };
  
  switch(currentStep) {
    case "welcome":
      return (
        <WelcomeStep 
          onComplete={handleWelcomeComplete} 
          activeStep={true}
        />
      );
    
    case "project-creation":
      return (
        <ProjectCreationStep 
          onComplete={handleProjectCreationComplete} 
          activeStep={true}
          goToPreviousStep={() => {
            console.log("Going back to welcome step");
            goToPreviousStep("project-creation");
            navigate('/onboarding/welcome');
          }}
        />
      );
    
    case "bot-selection":
      return (
        <BotSelectionStep 
          onComplete={handleBotSelectionComplete} 
          activeStep={true}
          goToPreviousStep={() => {
            console.log("Going back to project creation step");
            goToPreviousStep("bot-selection");
            navigate('/onboarding/project-creation');
          }}
        />
      );
    
    case "bot-setup":
      return (
        <BotSetupStep 
          onComplete={handleBotSetupComplete} 
          activeStep={true}
          goToPreviousStep={() => {
            console.log("Going back to bot selection step");
            goToPreviousStep("bot-setup");
            navigate('/onboarding/bot-selection');
          }}
        />
      );
      
    case "custom-bot-setup":
      return (
        <CustomBotSetupStep 
          onComplete={handleCustomBotSetupComplete} 
          activeStep={true}
          goToPreviousStep={() => {
            console.log("Going back to bot selection step");
            goToPreviousStep("custom-bot-setup");
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
            console.log("Going back to bot setup step");
            goToPreviousStep("connect-telegram");
            navigate('/onboarding/bot-setup');
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
