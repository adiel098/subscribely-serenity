
import React from "react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { OfficialBotInstructions } from "@/group_owners/components/onboarding/official-bot/OfficialBotInstructions";
import { OfficialBotSetupCard } from "@/group_owners/components/onboarding/official-bot/OfficialBotSetupCard";

interface OfficialBotSetupStepProps {
  onComplete: () => void;
  goToPreviousStep: () => void;
  activeStep: boolean;
}

const OfficialBotSetupStep: React.FC<OfficialBotSetupStepProps> = ({
  onComplete,
  goToPreviousStep,
  activeStep
}) => {
  return (
    <OnboardingLayout
      currentStep="custom-bot-setup"
      title="Set Up Official Bot"
      description="Configure the Membify official bot for your community"
      showBackButton={true}
      onBack={goToPreviousStep}
    >
      <div className="space-y-6 max-w-3xl mx-auto">
        <OfficialBotSetupCard onComplete={onComplete} goToPreviousStep={goToPreviousStep} />
        <OfficialBotInstructions />
      </div>
    </OnboardingLayout>
  );
};

export default OfficialBotSetupStep;
