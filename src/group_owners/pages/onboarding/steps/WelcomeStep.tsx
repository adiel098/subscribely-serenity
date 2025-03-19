
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
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <OnboardingLayout 
      currentStep="welcome"
      title="Welcome to Membify! 🚀"
      description="Let's get you set up to manage your Telegram communities with paid memberships."
      icon={<Rocket size={24} />}
      showBackButton={false}
    >
      <motion.div 
        className="space-y-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.p 
          className="text-gray-600"
          variants={item}
        >
          Complete this quick setup to start managing your Telegram communities with paid subscriptions. 
          We'll walk you through connecting your Telegram group, setting up payment methods, and choosing a platform plan.
        </motion.p>
        
        <div className="space-y-4">
          <motion.div variants={item}>
            <Card className="p-4 border border-indigo-100 bg-indigo-50/50 hover:shadow-md transition-all duration-300">
              <motion.h3 
                className="flex items-center gap-2 text-indigo-700 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Check size={18} className="text-indigo-600" />
                What you'll need to complete setup:
              </motion.h3>
              <motion.ul 
                className="mt-2 space-y-2 text-indigo-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <motion.li 
                  className="flex items-start gap-2"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <ArrowRight size={16} className="mt-1 flex-shrink-0" />
                  <span>A Telegram group where you are an admin</span>
                </motion.li>
                <motion.li 
                  className="flex items-start gap-2"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.0 }}
                >
                  <ArrowRight size={16} className="mt-1 flex-shrink-0" />
                  <span>Payment details for at least one payment method</span>
                </motion.li>
                <motion.li 
                  className="flex items-start gap-2"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  <ArrowRight size={16} className="mt-1 flex-shrink-0" />
                  <span>A few minutes to complete the setup process</span>
                </motion.li>
              </motion.ul>
            </Card>
          </motion.div>
          
          <motion.div variants={item}>
            <Card className="p-4 border border-green-100 bg-green-50/50 hover:shadow-md transition-all duration-300">
              <motion.h3 
                className="flex items-center gap-2 text-green-700 font-medium"
                whileHover={{ scale: 1.01 }}
              >
                <Shield size={18} className="text-green-600" />
                Security & Privacy:
              </motion.h3>
              <motion.p 
                className="mt-2 text-green-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                Your data is securely encrypted and we never share your information with third parties. 
                Membify only requires the minimum permissions needed to manage memberships.
              </motion.p>
            </Card>
          </motion.div>
        </div>
        
        <div className="pt-4 flex justify-end">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.3, duration: 0.5, type: "spring" }}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
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
      </motion.div>
    </OnboardingLayout>
  );
};
