
import React from "react";
import { Bot } from "lucide-react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { useCustomBotValidation } from "@/group_owners/hooks/onboarding/useCustomBotValidation";
import { CustomBotSetupCard } from "@/group_owners/components/onboarding/custom-bot/CustomBotSetupCard";

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
  const {
    customTokenInput,
    setCustomTokenInput,
    isValidating,
    validationSuccess,
    validateBotToken
  } = useCustomBotValidation({
    onComplete
  });

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
          validateBotToken={validateBotToken}
          isValidating={isValidating}
          validationSuccess={validationSuccess}
          goToPreviousStep={goToPreviousStep}
        />
      </div>
    </OnboardingLayout>
  );
};

export default CustomBotSetupStep;
