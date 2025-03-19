
import React from "react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface WelcomeStepProps {
  goToNextStep: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ goToNextStep }) => {
  return (
    <OnboardingLayout
      currentStep="welcome"
      title="Welcome to Membify"
      description="Let's set up your paid Telegram community in just a few steps"
      icon={<Sparkles className="w-6 h-6" />}
      // No back button for the first step
      showBackButton={false}
    >
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-medium text-gray-800">What you'll need to get started:</h2>
          
          <div className="space-y-3">
            {[
              { step: "1", text: "Connect your Telegram channel or group" },
              { step: "2", text: "Choose your platform subscription plan" },
              { step: "3", text: "Set up your payment methods" },
              { step: "4", text: "Start accepting paid subscribers" }
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-medium">
                  {item.step}
                </div>
                <p className="text-gray-700 mt-0.5">{item.text}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
            <p className="text-amber-800 text-sm">
              <span className="font-medium">Note:</span> You'll need admin privileges in your Telegram channel or group to add our bot and manage memberships.
            </p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="pt-4"
        >
          <Button 
            className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600 shadow-md"
            onClick={goToNextStep}
          >
            Let's Get Started
          </Button>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
};
