
import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { TelegramVerificationError } from "./TelegramVerificationError";
import { useToast } from "@/hooks/use-toast";
import Step1AddBot from "./steps/Step1AddBot";
import Step2CopyCode from "./steps/Step2CopyCode";
import Step3Verify from "./steps/Step3Verify";

interface TelegramVerificationFormProps {
  verificationCode: string | null;
  isLoading: boolean;
  isVerifying: boolean;
  attemptCount: number;
  onVerify: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export const TelegramVerificationForm: React.FC<TelegramVerificationFormProps> = ({
  verificationCode,
  isLoading,
  isVerifying,
  attemptCount,
  onVerify,
  onBack,
  showBackButton = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {attemptCount > 1 && (
        <TelegramVerificationError 
          showError={attemptCount > 1}
          errorCount={attemptCount}
          troubleshootingSteps={[
            "Make sure you've added @MembifyBot as an admin to your channel or group",
            "Ensure the bot has permission to post messages",
            "Try posting the verification code as a new message (don't edit an existing message)"
          ]}
        />
      )}
      
      <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-xl border border-indigo-100 rounded-xl overflow-hidden">
        <div className="space-y-10">
          {/* Step 1: Add Bot */}
          <Step1AddBot />

          {/* Step 2: Copy Code */}
          <Step2CopyCode 
            verificationCode={verificationCode} 
            isLoading={isLoading} 
          />

          {/* Step 3: Verify Connection */}
          <Step3Verify 
            verificationCode={verificationCode}
            isVerifying={isVerifying}
            isLoading={isLoading}
            onVerify={onVerify}
            onBack={onBack}
            showBackButton={showBackButton}
          />
        </div>
      </Card>
    </motion.div>
  );
};
