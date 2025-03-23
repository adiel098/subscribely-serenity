
import React from "react";
import { TelegramVerificationForm } from "../TelegramVerificationForm";

interface VerificationInProgressProps {
  verificationCode: string | null;
  isLoading: boolean;
  isVerifying: boolean;
  attemptCount: number;
  onVerify: () => void;
  onBack?: () => void;
  useCustomBot?: boolean;
  customBotToken?: string | null;
}

export const VerificationInProgress: React.FC<VerificationInProgressProps> = ({
  verificationCode,
  isLoading,
  isVerifying,
  attemptCount,
  onVerify,
  onBack,
  useCustomBot = false,
  customBotToken = null
}) => {
  return (
    <TelegramVerificationForm
      verificationCode={verificationCode}
      isLoading={isLoading}
      isVerifying={isVerifying}
      attemptCount={attemptCount}
      onVerify={onVerify}
      onBack={onBack}
      showBackButton={!!onBack}
      useCustomBot={useCustomBot}
      customBotToken={customBotToken}
    />
  );
};
