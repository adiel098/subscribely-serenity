
import { useState } from "react";
import { usePaymentRecord } from "./usePaymentRecord";
import { useInviteLink } from "./useInviteLink";
import { Subscription } from "../../services/memberService";

interface PaymentProcessingParams {
  communityId: string;
  planId: string;
  planPrice: number;
  communityInviteLink?: string | null;
  telegramUserId?: string;
  telegramUsername?: string;
  firstName?: string;
  lastName?: string;
  onSuccess?: () => void;
  activeSubscription?: Subscription | null;
}

export const usePaymentProcessing = ({
  communityId,
  planId,
  planPrice,
  communityInviteLink,
  telegramUserId,
  telegramUsername,
  firstName,
  lastName,
  onSuccess,
  activeSubscription
}: PaymentProcessingParams) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  
  const { recordPayment } = usePaymentRecord();
  const { fetchOrCreateInviteLink } = useInviteLink(communityInviteLink);

  // Reset processing state
  const resetState = () => {
    setIsLoading(false);
    setIsSuccess(false);
    setError(null);
  };
  
  // Process payment with the selected method
  const processPayment = async (paymentMethod: string) => {
    try {
      console.log(`[usePaymentProcessing] Starting payment process with ${paymentMethod}`);
      console.log('[usePaymentProcessing] communityId:', communityId);
      console.log('[usePaymentProcessing] planId:', planId);
      console.log('[usePaymentProcessing] telegramUserId:', telegramUserId);
      console.log('[usePaymentProcessing] telegramUsername:', telegramUsername);
      console.log('[usePaymentProcessing] firstName:', firstName);
      console.log('[usePaymentProcessing] lastName:', lastName);
      
      // Validate required parameters
      if (!communityId) throw new Error("Community ID is required");
      if (!planId) throw new Error("Plan ID is required");
      if (!telegramUserId) throw new Error("User ID is required");
      
      setIsLoading(true);
      setError(null);
      
      // Get an invite link if we don't have one yet or generate a new one
      let finalInviteLink = communityInviteLink;
      
      if (!communityInviteLink) {
        console.log("[usePaymentProcessing] No invite link provided, generating a new one");
        const generatedLink = await fetchOrCreateInviteLink(communityId);
        
        if (generatedLink) {
          finalInviteLink = generatedLink;
          console.log("[usePaymentProcessing] Successfully generated invite link:", finalInviteLink);
        } else {
          console.warn("[usePaymentProcessing] Could not generate invite link, proceeding without one");
        }
      }
      
      // Record the payment in the database
      const { success, paymentData, error: paymentError, inviteLink: paymentInviteLink } = await recordPayment({
        telegramUserId,
        communityId,
        planId,
        planPrice,
        paymentMethod,
        inviteLink: finalInviteLink,
        username: telegramUsername,
        firstName,
        lastName,
        activeSubscription
      });
      
      if (!success || paymentError) {
        throw new Error(paymentError || "Failed to record payment");
      }
      
      console.log("[usePaymentProcessing] Payment recorded successfully:", paymentData);
      
      // Use the invite link from the payment record if available
      if (paymentInviteLink) {
        setInviteLink(paymentInviteLink);
        console.log("[usePaymentProcessing] Using invite link from payment record:", paymentInviteLink);
      } else if (finalInviteLink) {
        setInviteLink(finalInviteLink);
        console.log("[usePaymentProcessing] Using original invite link:", finalInviteLink);
      }
      
      setIsSuccess(true);
      
      // Call the success callback if provided
      if (onSuccess) {
        console.log("[usePaymentProcessing] Calling onSuccess callback");
        onSuccess();
      }
      
      return true;
    } catch (err) {
      console.error("[usePaymentProcessing] Error processing payment:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
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
