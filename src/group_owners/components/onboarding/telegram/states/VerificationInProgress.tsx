
import React from "react";
import { TelegramVerificationForm } from "../TelegramVerificationForm";

interface VerificationInProgressProps {
  verificationCode: string | null;
  isLoading: boolean;
  isVerifying: boolean;
  attemptCount: number;
  verifyConnection: () => void;
  goToPreviousStep: () => void;
  useCustomBot?: boolean;
  customBotToken?: string | null;
}

export const VerificationInProgress: React.FC<VerificationInProgressProps> = ({
  verificationCode,
  isLoading,
  isVerifying,
  attemptCount,
  verifyConnection,
  goToPreviousStep,
  useCustomBot = false,
  customBotToken = null
}) => {
  return (
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
  );
};
