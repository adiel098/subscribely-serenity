
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useInviteLink } from "./useInviteLink";
import { usePaymentRecord } from "./usePaymentRecord";
import { usePaymentHandler } from "./use-payment-hooks/usePaymentHandler";
import { createPaymentToast } from "./use-payment-hooks/paymentUtils";

interface UsePaymentProcessingOptions {
  communityId: string;
  planId: string;
  planPrice: number;
  communityInviteLink: string | null;
  telegramUserId?: string;
  telegramUsername?: string;
  onSuccess?: () => void;
}

export const usePaymentProcessing = ({
  communityId,
  planId,
  planPrice,
  communityInviteLink,
  telegramUserId,
  telegramUsername,
  onSuccess
}: UsePaymentProcessingOptions) => {
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Use the invite link hook
  const { inviteLink, fetchOrCreateInviteLink } = useInviteLink(communityInviteLink);
  
  // Use the payment record hook
  const { recordPayment } = usePaymentRecord();
  
  // Use our payment handler
  const { processPaymentWithMethod, isLoading, error, setError } = usePaymentHandler({
    telegramUserId,
    telegramUsername,
    communityId,
    planId,
    onSuccess: () => {
      setIsSuccess(true);
      onSuccess?.();
    }
  });

  const processPayment = async (paymentMethod: string) => {
    console.log('[usePaymentProcessing] Starting payment processing with method:', paymentMethod);
    
    const success = await processPaymentWithMethod(
      paymentMethod,
      recordPayment,
      inviteLink,
      fetchOrCreateInviteLink
    );
    
    if (success) {
      setIsSuccess(true);
      console.log(`[usePaymentProcessing] Payment process completed successfully.`);
      createPaymentToast(true, inviteLink);
      return true;
    }
    
    return false;
  };

  const resetState = () => {
    setIsSuccess(false);
    setError(null);
  };

  return {
    processPayment,
    isLoading,
    error,
    isSuccess,
    inviteLink,
    resetState
  };
};
