
import { useState } from "react";
import { usePaymentRecord } from "./usePaymentRecord";
import { useInviteLink } from "./useInviteLink";
import { useMemberCreation } from "./useMemberCreation";
import { usePaymentInviteLink } from "./usePaymentInviteLink";
import { PaymentProcessingParams } from "./types/paymentProcessing.types";
import { toast } from "sonner";
import { 
  resetPaymentState,
  setPaymentLoadingState,
  setPaymentSuccessState,
  setPaymentErrorState 
} from "./utils/payment-state.utils";

export const usePaymentProcessing = ({
  communityId,
  planId,
  planPrice,
  planInterval,
  communityInviteLink,
  telegramUserId,
  telegramUsername,
  firstName,
  lastName,
  onSuccess,
  onError,
  onStart,
  activeSubscription
}: PaymentProcessingParams) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { recordPayment } = usePaymentRecord();
  const { fetchOrCreateInviteLink } = useInviteLink(communityInviteLink);
  const { createMember } = useMemberCreation();
  const { inviteLink, setInviteLink, processInviteLink } = usePaymentInviteLink();

  // Reset processing state
  const resetState = () => {
    resetPaymentState(setIsLoading, setIsSuccess, setError);
  };
  
  // Process payment with the selected method
  const processPayment = async (paymentMethod: string) => {
    try {
      console.log(`[usePaymentProcessing] Starting payment process with ${paymentMethod}`);
      console.log('[usePaymentProcessing] communityId:', communityId);
      console.log('[usePaymentProcessing] planId:', planId);
      console.log('[usePaymentProcessing] planInterval:', planInterval);
      console.log('[usePaymentProcessing] telegramUserId:', telegramUserId);
      console.log('[usePaymentProcessing] telegramUsername:', telegramUsername);
      console.log('[usePaymentProcessing] firstName:', firstName);
      console.log('[usePaymentProcessing] lastName:', lastName);
      
      // Validate required parameters
      if (!communityId) throw new Error("Community ID is required");
      if (!planId) throw new Error("Plan ID is required");
      if (!telegramUserId) throw new Error("User ID is required");
      
      // Set loading state and notify start
      setPaymentLoadingState(setIsLoading, setError, onStart);
      
      // Get an invite link if we don't have one yet or generate a new one
      let finalInviteLink = await processInviteLink(
        communityInviteLink,
        fetchOrCreateInviteLink,
        communityId
      );
      
      // Record the payment in the database, including the plan interval
      const { success, paymentData, error: paymentError, inviteLink: paymentInviteLink } = await recordPayment({
        telegramUserId,
        communityId,
        planId,
        amount: planPrice,
        paymentMethod,
        inviteLink: finalInviteLink, // This could be a JSON string for groups
        username: telegramUsername,
        firstName,
        lastName,
        activeSubscription,
        interval: planInterval
      });
      
      if (!success || paymentError) {
        const errorMsg = paymentError || "Failed to record payment";
        throw new Error(errorMsg);
      }
      
      console.log("[usePaymentProcessing] Payment recorded successfully:", paymentData);
      
      // IMMEDIATE MEMBER CREATION: Create or update the member record right after payment
      const memberCreated = await createMember({
        telegramUserId,
        communityId,
        planId,
        planInterval,
        paymentId: paymentData?.id,
        telegramUsername
      });
      
      if (!memberCreated) {
        console.error("[usePaymentProcessing] Failed to create/update member record");
        toast.error("Payment processed but membership record creation failed");
      } else {
        console.log("[usePaymentProcessing] Member record created/updated successfully");
      }
      
      // Update the invite link if needed
      if (paymentInviteLink) {
        setInviteLink(paymentInviteLink);
      }
      
      // Set success state and notify completion
      setPaymentSuccessState(setIsLoading, setIsSuccess, onSuccess);
      
      return true;
    } catch (err) {
      console.error("[usePaymentProcessing] Error processing payment:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      
      // Set error state and notify
      setPaymentErrorState(setIsLoading, setError, errorMessage, onError);
      
      return false;
    }
  };
  
  return {
    processPayment,
    isLoading,
    isSuccess,
    error,
    inviteLink,
    resetState
  };
};
