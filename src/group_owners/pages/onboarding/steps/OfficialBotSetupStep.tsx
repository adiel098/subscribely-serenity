
import React from "react";
import { Bot, ArrowLeft } from "lucide-react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { OfficialBotSetupCard } from "@/group_owners/components/onboarding/official-bot/OfficialBotSetupCard";

interface OfficialBotSetupStepProps {
  onComplete: () => void;
  activeStep: boolean;
  goToPreviousStep: () => void;
}

const OfficialBotSetupStep = ({
  onComplete,
  activeStep,
  goToPreviousStep
}: OfficialBotSetupStepProps) => {
  return (
    <OnboardingLayout
      currentStep="official-bot-setup"
      title="Official Bot Setup"
      description="Configure the Membify official bot for your community"
      icon={<Bot className="w-6 h-6" />}
      showBackButton={true}
      onBack={goToPreviousStep}
    >
      <div className="max-w-3xl mx-auto">
        <OfficialBotSetupCard
          onComplete={onComplete}
          goToPreviousStep={goToPreviousStep}
        />
      </div>
    </OnboardingLayout>
  );
};

export default OfficialBotSetupStep;
