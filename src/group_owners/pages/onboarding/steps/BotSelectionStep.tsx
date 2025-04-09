
import React from "react";
import { Bot, ArrowRight, ArrowLeft } from "lucide-react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/contexts/AuthContext";
import { BotSelectionCards } from "@/group_owners/components/onboarding/bot-selection/BotSelectionCards";
import { useBotSelectionActions } from "@/group_owners/hooks/onboarding/useBotSelectionActions";

interface BotSelectionStepProps {
  onComplete: () => void;
  activeStep: boolean;
  goToPreviousStep: () => void;
}

const BotSelectionStep = ({ 
  onComplete, 
  activeStep,
  goToPreviousStep
}: BotSelectionStepProps) => {
  const { user } = useAuth();
  const { selected, setSelected, isLoading, saveBotSelection } = useBotSelectionActions({
    userId: user?.id,
    onComplete
  });

  return (
    <OnboardingLayout
      currentStep="project-creation"  // Changed from "bot-selection" to a valid step
      title="Choose Your Bot"
      description="Select which Telegram bot you want to use for your communities"
      icon={<Bot className="w-6 h-6" />}
      showBackButton={true}
      onBack={goToPreviousStep}
    >
      <div className="grid gap-6 max-w-4xl mx-auto">
        <BotSelectionCards 
          selected={selected} 
          setSelected={setSelected} 
        />

        <div className="flex justify-between mt-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPreviousStep}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          
          <Button 
            onClick={saveBotSelection} 
            size="lg" 
            disabled={!selected || isLoading}
            className="min-w-[200px] gap-2"
          >
            {isLoading ? "Saving..." : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center text-sm text-gray-500 mt-2">
          <p>This selection is permanent and cannot be changed later</p>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default BotSelectionStep;
