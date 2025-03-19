
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { Rocket, ArrowRight } from "lucide-react";

interface WelcomeStepProps {
  onComplete: () => void;
  activeStep: boolean;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onComplete, activeStep }) => {
  return (
    <OnboardingLayout
      currentStep="welcome"
      title="Welcome to Community Memberships"
      description="Start monetizing your Telegram community in a few simple steps"
      icon={<Rocket className="w-6 h-6 text-blue-500" />}
      showBackButton={false}
    >
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
        >
          <h2 className="text-xl font-semibold text-blue-800 mb-4">What You'll Set Up</h2>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium text-blue-800">Connect Your Telegram Channel or Group</p>
                <p className="text-sm text-blue-600">Link your existing Telegram community to start managing paid access</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium text-blue-800">Choose Your Platform Plan</p>
                <p className="text-sm text-blue-600">Select the right plan for your needs and community size</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium text-blue-800">Create Subscription Plans</p>
                <p className="text-sm text-blue-600">Define pricing and benefits for your community members</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mt-0.5">
                4
              </div>
              <div>
                <p className="font-medium text-blue-800">Set Up Payment Methods</p>
                <p className="text-sm text-blue-600">Choose how you want to receive payments from your members</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            onClick={onComplete}
          >
            Let's Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </OnboardingLayout>
  );
};
