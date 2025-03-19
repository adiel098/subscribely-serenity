
import { useEffect } from "react";
import { Button } from "@/components/ui/ui/button";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { OnboardingState } from "@/group_owners/hooks/useOnboarding";
import confetti from "canvas-confetti";

interface CompleteStepProps {
  completeOnboarding: () => Promise<void>;
  state: OnboardingState;
}

export const CompleteStep: React.FC<CompleteStepProps> = ({
  completeOnboarding,
  state
}) => {
  // Trigger confetti when page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Auto-complete if all steps are done
  useEffect(() => {
    if (state.isTelegramConnected && state.hasPlatformPlan && state.hasPaymentMethod) {
      // Allow the confetti to play before completing
      const timer = setTimeout(() => {
        completeOnboarding();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [state, completeOnboarding]);
  
  return (
    <OnboardingLayout
      currentStep="complete"
      title="Setup Complete! 🎉"
      description="You're all set to start using Membify"
      icon={<CheckCircle className="h-6 w-6" />}
      showProgress={false}
    >
      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-green-800 mb-2">Congratulations!</h2>
          <p className="text-green-700 mb-6">Your Membify account is now fully set up</p>
          
          <div className="space-y-3 text-left mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">Telegram group connected</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">Platform subscription activated</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">Payment methods configured</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <Button 
            size="lg" 
            onClick={completeOnboarding}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 py-6 px-10 text-lg"
          >
            Go to Dashboard <ArrowRight className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
};
