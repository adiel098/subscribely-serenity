
import React from "react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

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

  const handleCompleteOnboarding = async () => {
    try {
      await onComplete();
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  };

  return (
    <OnboardingLayout
      currentStep="complete"
      title="You're All Set!"
      description="Your Telegram community is ready to accept paid memberships"
      icon={<CheckCircle className="w-6 h-6 text-green-500" />}
      showBackButton={false}
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
            Success! 🎉
          </h2>
          
          <p className="text-center text-green-700 mb-4">
            Your Telegram community has been successfully connected to Membify.
          </p>
          
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                ✓
              </div>
              <p className="text-green-700">
                Community connection verified
              </p>
            </li>
            
            <li className="flex items-center gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                ✓
              </div>
              <p className="text-green-700">
                Bot permissions configured
              </p>
            </li>
            
            <li className="flex items-center gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center">
                ✓
              </div>
              <p className="text-green-700">
                Ready to create subscription plans
              </p>
            </li>
          </ul>
          
          <p className="text-center text-sm text-green-600 italic mb-4">
            You can now set up subscription plans and start accepting members!
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
