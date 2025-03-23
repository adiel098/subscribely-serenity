
import React from "react";
import { TelegramVerificationError } from "../TelegramVerificationError";
import { fetchOrGenerateVerificationCode } from "@/group_owners/utils/verificationCodeUtils";
import { useToast } from "@/components/ui/use-toast";

interface DuplicateChannelErrorProps {
  duplicateChatId: string;  // Changed from userId to duplicateChatId to match usage
  onRetry: (code?: string) => void;  // Made code parameter optional
}

export const DuplicateChannelError: React.FC<DuplicateChannelErrorProps> = ({
  duplicateChatId,
  onRetry,
}) => {
  const { toast } = useToast();

  const handleBack = async () => {
    // Reset the verification state and try again
    onRetry(); // Call onRetry directly, ConnectTelegramStep will handle the code
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
