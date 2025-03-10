
import { useState } from "react";
import { usePaymentRecord } from "./usePaymentRecord";
import { useInviteLink } from "./useInviteLink";
import { Subscription } from "../../services/memberService";
import { createOrUpdateMember } from "../../services/memberService";
import { toast } from "sonner";

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
  onError?: (error: string) => void;
  onStart?: () => void;
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
  onError,
  onStart,
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
      
      // Notify that payment processing has started
      if (onStart) {
        onStart();
      }
      
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
        amount: planPrice,
        paymentMethod,
        inviteLink: finalInviteLink,
        username: telegramUsername,
        firstName,
        lastName,
        activeSubscription
      });
      
      if (!success || paymentError) {
        const errorMsg = paymentError || "Failed to record payment";
        throw new Error(errorMsg);
      }
      
      console.log("[usePaymentProcessing] Payment recorded successfully:", paymentData);
      
      // 1. IMMEDIATE MEMBER CREATION: Create or update the member record right after payment
      // Calculate start and end dates for subscription
      const startDate = new Date();
      let endDate = new Date(startDate);
      
      // Add time based on plan interval (we'll fetch this in createOrUpdateMember)
      // The member will be created with active status
      
      const memberResult = await createOrUpdateMember({
        telegram_id: telegramUserId,
        community_id: communityId,
        subscription_plan_id: planId,
        status: 'active',
        payment_id: paymentData?.id,
        username: telegramUsername,
        subscription_start_date: startDate.toISOString(),
        // Let the service set the end date based on the plan interval
      });
      
      if (!memberResult) {
        console.error("[usePaymentProcessing] Failed to create/update member record");
        toast.error("Payment processed but membership record creation failed");
        // Continue anyway as payment was successful
      } else {
        console.log("[usePaymentProcessing] Member record created/updated successfully");
      }
      
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
      
      // Call the error callback if provided
      if (onError) {
        onError(errorMessage);
      }
      
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
