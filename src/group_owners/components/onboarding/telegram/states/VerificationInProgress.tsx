
import React from "react";
import { TelegramVerificationForm } from "../TelegramVerificationForm";

interface VerificationInProgressProps {
  verificationCode: string | null;
  isLoading: boolean;
  isVerifying: boolean;
  attemptCount: number;
  verifyConnection: () => void;
  goToPreviousStep: () => void;
}

export const VerificationInProgress: React.FC<VerificationInProgressProps> = ({
  verificationCode,
  isLoading,
  isVerifying,
  attemptCount,
  verifyConnection,
  goToPreviousStep
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
    />
  );
};
