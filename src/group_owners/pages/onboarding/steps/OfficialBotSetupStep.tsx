import React from "react";
import { Bot } from "lucide-react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { OfficialBotSetupCard } from "@/group_owners/components/onboarding/official-bot/OfficialBotSetupCard";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  
  // This component should redirect to connect-telegram
  // But we'll keep it for backward compatibility
  React.useEffect(() => {
    navigate('/onboarding/connect-telegram', { replace: true });
  }, [navigate]);

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
