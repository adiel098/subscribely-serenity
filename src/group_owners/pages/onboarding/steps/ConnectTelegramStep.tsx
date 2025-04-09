
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/group_owners/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { MessageSquare, Check, ArrowLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { TelegramVerificationForm } from "@/group_owners/components/onboarding/telegram/TelegramVerificationForm";
import { useTelegramVerificationState } from "@/group_owners/hooks/onboarding/useTelegramVerificationState";
import { Card } from "@/components/ui/card";

interface ConnectTelegramStepProps {
  onComplete: () => void;
  activeStep: boolean;
  goToPreviousStep: () => void;
}

const ConnectTelegramStep: React.FC<ConnectTelegramStepProps> = ({
  onComplete,
  activeStep,
  goToPreviousStep
}) => {
  const navigate = useNavigate();
  const {
    verificationCode,
    isLoading,
    isVerifying,
    isVerified,
    attemptCount,
    duplicateChatId,
    displayedCommunity,
    verifyConnection,
    handleCodeRetry,
    useCustomBot,
    customBotToken
  } = useTelegramVerificationState();
  
  // When a community is connected, move to the next step
  useEffect(() => {
    if (displayedCommunity) {
      onComplete();
    }
  }, [displayedCommunity, onComplete]);

  return (
    <OnboardingLayout
      currentStep="connect-telegram"
      title="Connect Your Telegram Community 🌐"
      description="Link your bot to your Telegram group or channel"
      icon={<MessageSquare className="w-6 h-6" />}
      showBackButton={true}
      onBack={goToPreviousStep}
    >
      <div className="space-y-6">
        {displayedCommunity ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-100 shadow-sm">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-center text-green-800 mb-2">
                Connection Successful! 🎉
              </h2>
              
              <p className="text-center text-green-700 mb-4">
                Your community <strong>{displayedCommunity.title}</strong> has been linked to your account.
              </p>
              
              <Button
                onClick={onComplete}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          </motion.div>
        ) : (
          <TelegramVerificationForm
            verificationCode={verificationCode}
            isLoading={isLoading}
            isVerifying={isVerifying}
            attemptCount={attemptCount}
            onVerify={verifyConnection}
            onBack={goToPreviousStep}
            showBackButton={true}
            useCustomBot={useCustomBot}
            customBotToken={customBotToken}
          />
        )}
      </div>
    </OnboardingLayout>
  );
};

export default ConnectTelegramStep;
