
import React from "react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { OnboardingState } from "@/group_owners/hooks/onboarding/types";

interface CompletionStepProps {
  onComplete: () => Promise<void>;
  goToPreviousStep: () => void;
  activeStep: boolean;
}

const CompletionStep: React.FC<CompletionStepProps> = ({ 
  onComplete, 
  goToPreviousStep,
  activeStep 
}) => {
  const navigate = useNavigate();

  // Mock state for demonstration - in a real app, this would come from a hook or props
  const state: OnboardingState = {
    currentStep: "complete",
    isCompleted: false,
    isTelegramConnected: true,
    hasPlatformPlan: true,
    hasPaymentMethod: true
  };

  const handleCompleteOnboarding = async () => {
    try {
      await onComplete();
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  };

  // Calculate the number of steps completed
  const getTotalStepsCompleted = () => {
    let count = 0;
    if (state.isTelegramConnected) count++;
    if (state.hasPlatformPlan) count++;
    if (state.hasPaymentMethod) count++;
    return count;
  };

  return (
    <OnboardingLayout
      currentStep="complete"
      title="You're All Set!"
      description="Your Telegram community is ready to accept paid memberships"
      icon={<CheckCircle className="w-6 h-6 text-green-500" />}
      showBackButton={true}
      onBack={goToPreviousStep}
    >
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-6"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-center text-green-800 mb-2">
            Onboarding Complete!
          </h2>
          
          <p className="text-center text-green-700 mb-4">
            You've completed {getTotalStepsCompleted()} out of 3 essential steps.
          </p>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${state.isTelegramConnected ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                {state.isTelegramConnected ? "✓" : "1"}
              </div>
              <p className={`${state.isTelegramConnected ? "text-green-700" : "text-gray-500"}`}>
                {state.isTelegramConnected ? "Telegram channel connected" : "Connect Telegram channel"}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${state.hasPlatformPlan ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                {state.hasPlatformPlan ? "✓" : "2"}
              </div>
              <p className={`${state.hasPlatformPlan ? "text-green-700" : "text-gray-500"}`}>
                {state.hasPlatformPlan ? "Platform plan selected" : "Select platform plan"}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${state.hasPaymentMethod ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                {state.hasPaymentMethod ? "✓" : "3"}
              </div>
              <p className={`${state.hasPaymentMethod ? "text-green-700" : "text-gray-500"}`}>
                {state.hasPaymentMethod ? "Payment methods configured" : "Configure payment methods"}
              </p>
            </div>
          </div>
          
          <p className="text-center text-sm text-green-600 italic mb-4">
            Don't worry! You can always update these settings later from your dashboard.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button 
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-md"
            onClick={handleCompleteOnboarding}
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
};

export default CompletionStep;
