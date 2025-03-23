
import React from "react";
import { Bot } from "lucide-react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { CustomBotSetupCard } from "@/group_owners/components/onboarding/custom-bot/CustomBotSetupCard";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CustomBotSetupStepProps {
  onComplete: () => void;
  activeStep: boolean;
  goToPreviousStep: () => void;
}

const CustomBotSetupStep = ({
  onComplete,
  activeStep,
  goToPreviousStep
}: CustomBotSetupStepProps) => {
  const [customTokenInput, setCustomTokenInput] = useState<string>("");
  
  // Store the token when completing this step
  const handleContinue = async () => {
    if (!customTokenInput) {
      toast.error("Please enter your bot token");
      return;
    }
    
    try {
      // Just save the token without validation
      await supabase.rpc('set_bot_preference', { 
        use_custom: true,
        custom_token: customTokenInput
      });
      
      // Continue to next step
      onComplete();
    } catch (error) {
      console.error("Error saving bot token:", error);
      toast.error("Failed to save bot token");
    }
  };

  return (
    <OnboardingLayout
      currentStep="custom-bot-setup"
      title="Custom Bot Setup"
      description="Configure your custom Telegram bot"
      icon={<Bot className="w-6 h-6" />}
      showBackButton={true}
      onBack={goToPreviousStep}
    >
      <div className="max-w-3xl mx-auto">
        <CustomBotSetupCard
          customTokenInput={customTokenInput}
          setCustomTokenInput={setCustomTokenInput}
          goToPreviousStep={goToPreviousStep}
        />
      </div>
      <div className="max-w-3xl mx-auto flex justify-end mt-4">
        <button
          onClick={handleContinue}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Continue to Connect Telegram
        </button>
      </div>
    </OnboardingLayout>
  );
};

export default CustomBotSetupStep;
