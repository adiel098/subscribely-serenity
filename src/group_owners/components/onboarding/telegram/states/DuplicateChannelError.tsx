
import React from "react";
import { TelegramVerificationError } from "../TelegramVerificationError";
import { fetchOrGenerateVerificationCode } from "@/group_owners/utils/verificationCodeUtils";
import { useToast } from "@/components/ui/use-toast";

interface DuplicateChannelErrorProps {
  userId: string;
  onRetry: (code: string) => void;
}

export const DuplicateChannelError: React.FC<DuplicateChannelErrorProps> = ({
  userId,
  onRetry,
}) => {
  const { toast } = useToast();

  const handleBack = async () => {
    // Reset the verification state and try again
    if (userId) {
      fetchOrGenerateVerificationCode(userId, toast)
        .then(code => {
          if (code) onRetry(code);
        });
    }
  };

  return (
    <TelegramVerificationError 
      title="Duplicate Telegram Channel Detected"
      description="This Telegram channel is already connected to another account."
      troubleshootingSteps={[
        "Use a different Telegram channel or group.",
        "If you believe this is an error, please contact support."
      ]}
      onBack={handleBack}
      showError={true}
    />
  );
};
