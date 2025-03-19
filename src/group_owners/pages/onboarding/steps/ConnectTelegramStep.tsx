
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, ArrowRight, Loader2, Bot, AlertCircle, ArrowLeft } from "lucide-react";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircleIcon } from "lucide-react";

interface ConnectTelegramStepProps {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  isTelegramConnected: boolean;
  saveCurrentStep: (step: string) => void;
}

export const ConnectTelegramStep: React.FC<ConnectTelegramStepProps> = ({ 
  goToNextStep, 
  goToPreviousStep,
  isTelegramConnected,
  saveCurrentStep
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const navigate = useNavigate();

  const handleConnectTelegram = () => {
    setIsConnecting(true);
    // Store the current onboarding step before navigating away
    saveCurrentStep('connect-telegram');
    // Navigate to the Telegram connection page
    navigate('/connect/telegram', { state: { fromOnboarding: true } });
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <OnboardingLayout 
      currentStep="connect-telegram"
      title="Connect Your Telegram Group"
      description="Link your Telegram group to enable membership management"
      icon={<MessageCircle size={24} />}
      onBack={goToPreviousStep}
      showBackButton={true}
    >
      <motion.div 
        className="space-y-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {isTelegramConnected ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <Alert className="bg-green-50 border-green-200">
              <motion.div 
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 15, 0, -15, 0] }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
              </motion.div>
              <AlertTitle className="text-green-800">Group Connected!</AlertTitle>
              <AlertDescription className="text-green-700">
                Your Telegram group has been successfully connected to Membify.
              </AlertDescription>
            </Alert>
          </motion.div>
        ) : (
          <motion.div variants={item}>
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Connection Required</AlertTitle>
              <AlertDescription className="text-blue-700">
                You need to connect at least one Telegram group to continue.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <motion.div 
          variants={item}
          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
        >
          <Card className="p-5 border border-indigo-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="space-y-4">
              <motion.h3 
                className="text-lg font-medium text-gray-800 flex items-center gap-2"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{ delay: 0.8, duration: 1, repeat: 1 }}
                >
                  <Bot className="text-indigo-600" size={20} />
                </motion.div>
                How to connect your Telegram group
              </motion.h3>
              <motion.ol 
                className="space-y-3 list-decimal list-inside text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <motion.li 
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  Add our bot <span className="font-semibold">@MembifyBot</span> to your Telegram group
                </motion.li>
                <motion.li 
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  Make the bot an admin with the required permissions
                </motion.li>
                <motion.li 
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  Send a verification code in your group chat
                </motion.li>
                <motion.li 
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.0 }}
                >
                  Complete the verification process
                </motion.li>
              </motion.ol>
              <motion.p 
                className="text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                Our tutorial will guide you through this process step by step.
              </motion.p>
            </div>
          </Card>
        </motion.div>
        
        <div className="pt-4 flex justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          >
            <Button 
              variant="outline" 
              onClick={goToPreviousStep}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
          </motion.div>
          
          {isTelegramConnected ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <Button 
                onClick={goToNextStep}
                size="lg" 
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                Continue to Platform Plan
                <ArrowRight size={16} />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <Button 
                onClick={handleConnectTelegram}
                size="lg" 
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect Telegram Group
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </OnboardingLayout>
  );
};
