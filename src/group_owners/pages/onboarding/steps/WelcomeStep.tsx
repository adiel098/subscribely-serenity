
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rocket, ArrowRight, Check, Shield } from "lucide-react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";

interface WelcomeStepProps {
  goToNextStep: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ goToNextStep }) => {
  return (
    <OnboardingLayout 
      currentStep="welcome"
      title="Welcome to Membify! 🚀"
      description="Let's get you set up to manage your Telegram communities with paid memberships."
      icon={<Rocket size={24} />}
      showBackButton={false}
    >
      <div className="space-y-6">
        <p className="text-gray-600">
          Complete this quick setup to start managing your Telegram communities with paid subscriptions. 
          We'll walk you through connecting your Telegram group, setting up payment methods, and choosing a platform plan.
        </p>
        
        <div className="space-y-4">
          <Card className="p-4 border border-indigo-100 bg-indigo-50/50">
            <h3 className="flex items-center gap-2 text-indigo-700 font-medium">
              <Check size={18} className="text-indigo-600" />
              What you'll need to complete setup:
            </h3>
            <ul className="mt-2 space-y-2 text-indigo-700">
              <li className="flex items-start gap-2">
                <ArrowRight size={16} className="mt-1 flex-shrink-0" />
                <span>A Telegram group where you are an admin</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight size={16} className="mt-1 flex-shrink-0" />
                <span>Payment details for at least one payment method</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight size={16} className="mt-1 flex-shrink-0" />
                <span>A few minutes to complete the setup process</span>
              </li>
            </ul>
          </Card>
          
          <Card className="p-4 border border-green-100 bg-green-50/50">
            <h3 className="flex items-center gap-2 text-green-700 font-medium">
              <Shield size={18} className="text-green-600" />
              Security & Privacy:
            </h3>
            <p className="mt-2 text-green-700">
              Your data is securely encrypted and we never share your information with third parties. 
              Membify only requires the minimum permissions needed to manage memberships.
            </p>
          </Card>
        </div>
        
        <div className="pt-4 flex justify-end">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button 
              onClick={goToNextStep}
              size="lg" 
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              Let's Get Started
              <ArrowRight size={16} />
            </Button>
          </motion.div>
        </div>
      </div>
    </OnboardingLayout>
  );
};
