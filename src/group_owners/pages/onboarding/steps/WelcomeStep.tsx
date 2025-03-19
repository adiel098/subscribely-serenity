
import React from "react";
import { PartyPopper, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";

interface WelcomeStepProps {
  onComplete: () => void;
  activeStep: boolean;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onComplete, activeStep }) => {
  return (
    <OnboardingLayout
      currentStep="welcome"
      title="Welcome to Membify!"
      description="Let's set up your account to manage Telegram groups with paid memberships"
      icon={<PartyPopper className="w-6 h-6" />}
    >
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-center"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Ready to grow your community?</h2>
          <p className="text-gray-600">
            You're just a few steps away from managing your premium Telegram community.
            We'll guide you through the setup process.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-indigo-50 rounded-xl p-6 border border-indigo-100"
        >
          <h3 className="font-medium text-indigo-800 mb-3">What you'll need to set up:</h3>
          <ul className="space-y-2 text-left">
            <li className="flex items-start gap-2">
              <div className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <span className="text-gray-700">Connect your Telegram channel or group</span>
            </li>
          </ul>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="flex justify-center"
        >
          <Button 
            onClick={onComplete}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            size="lg"
          >
            Let's Begin
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
};
