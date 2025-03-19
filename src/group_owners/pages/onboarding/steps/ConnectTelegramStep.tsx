
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

  return (
    <OnboardingLayout 
      currentStep="connect-telegram"
      title="Connect Your Telegram Group"
      description="Link your Telegram group to enable membership management"
      icon={<MessageCircle size={24} />}
      onBack={goToPreviousStep}
      showBackButton={true}
    >
      <div className="space-y-6">
        {isTelegramConnected ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Group Connected!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your Telegram group has been successfully connected to Membify.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Connection Required</AlertTitle>
            <AlertDescription className="text-blue-700">
              You need to connect at least one Telegram group to continue.
            </AlertDescription>
          </Alert>
        )}

        <Card className="p-5 border border-indigo-100">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
              <Bot className="text-indigo-600" size={20} />
              How to connect your Telegram group
            </h3>
            <ol className="space-y-3 list-decimal list-inside text-gray-600">
              <li>Add our bot <span className="font-semibold">@MembifyBot</span> to your Telegram group</li>
              <li>Make the bot an admin with the required permissions</li>
              <li>Send a verification code in your group chat</li>
              <li>Complete the verification process</li>
            </ol>
            <p className="text-sm text-gray-500">
              Our tutorial will guide you through this process step by step.
            </p>
          </div>
        </Card>
        
        <div className="pt-4 flex justify-between">
          <Button 
            variant="outline" 
            onClick={goToPreviousStep}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          
          {isTelegramConnected ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
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
          )}
        </div>
      </div>
    </OnboardingLayout>
  );
};
