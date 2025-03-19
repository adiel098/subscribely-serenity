
import { Button } from "@/components/ui/button";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { ArrowRight, Rocket } from "lucide-react";
import { motion } from "framer-motion";

interface WelcomeStepProps {
  goToNextStep: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ goToNextStep }) => {
  return (
    <OnboardingLayout
      currentStep="welcome"
      title="Welcome to Membify! 🚀"
      description="Let's set up your account in a few easy steps"
      icon={<Rocket className="h-6 w-6" />}
    >
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 border border-blue-100 rounded-lg p-5 text-blue-800"
        >
          <h3 className="font-semibold text-lg mb-2">Here's what we'll do next:</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <div className="flex-shrink-0 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mt-0.5">1</div>
              <div>
                <span className="font-medium">Connect your Telegram group</span>
                <p className="text-sm text-blue-700 mt-1">Link your community to start managing members</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="flex-shrink-0 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mt-0.5">2</div>
              <div>
                <span className="font-medium">Choose a platform plan</span>
                <p className="text-sm text-blue-700 mt-1">Select a subscription that fits your community needs</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="flex-shrink-0 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mt-0.5">3</div>
              <div>
                <span className="font-medium">Set up a payment method</span>
                <p className="text-sm text-blue-700 mt-1">Add how you'll accept payments from your members</p>
              </div>
            </li>
          </ul>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <Button 
            size="lg" 
            onClick={goToNextStep}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 py-6 px-8 text-lg"
          >
            Let's Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
};
