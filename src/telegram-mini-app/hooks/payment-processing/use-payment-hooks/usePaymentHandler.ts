
import { useState } from "react";
import { useMembershipUpdate } from "../useMembershipUpdate";
import { createPaymentToast, generateDemoPaymentId, validateAndLogPayment } from "./paymentUtils";
import { useFetchPlanDetails } from "./useFetchPlanDetails";
import { logPaymentAction } from "../utils";

interface PaymentHandlerOptions {
  telegramUserId?: string;
  telegramUsername?: string;
  communityId: string;
  planId: string;
  onSuccess?: () => void;
}

/**
 * Hook for handling the payment process
 */
export const usePaymentHandler = ({
  telegramUserId,
  telegramUsername,
  communityId,
  planId,
  onSuccess
}: PaymentHandlerOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use the membership update hook
  const { updateMembershipStatus } = useMembershipUpdate();
  const { fetchPlanDetails } = useFetchPlanDetails();
  
  /**
   * Executes the final step of the payment process by updating membership status
   */
  const finalizePayment = async (
    paymentId: string,
    inviteLink: string | null,
    planDetails: any
  ) => {
    console.log(`[usePaymentHandler] Finalizing payment by updating membership status IMMEDIATELY after payment.`);
    
    console.log('[usePaymentHandler] Updating membership with params:', {
      telegramUserId: telegramUserId!,
      communityId,
      planId,
      paymentId,
      username: telegramUsername,
      planDetails
    });
    
    // Update membership status - THIS WILL IMMEDIATELY CREATE A MEMBER RECORD WITH SUBSCRIPTION DETAILS
    const membershipUpdated = await updateMembershipStatus({
      telegramUserId: telegramUserId!,
      communityId,
      planId,
      paymentId,
      username: telegramUsername,
      planDetails
    });

    if (!membershipUpdated) {
      console.error(`[usePaymentHandler] Membership update failed.`);
      throw new Error("Failed to update membership status");
    }

    console.log(`[usePaymentHandler] Membership updated successfully with subscription details.`);
    logPaymentAction('Payment processing completed successfully', { inviteLink });
    
    // Call success callback if provided
    onSuccess?.();
    
    return true;
  };
  
  /**
   * Process a payment with the specified payment method
   */
  const processPaymentWithMethod = async (
    paymentMethod: string, 
    recordPayment: Function,
    inviteLink: string | null,
    fetchOrCreateInviteLink: Function
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[usePaymentHandler] Starting payment processing');
      
      // Validate all required parameters
      const validation = validateAndLogPayment(telegramUserId, communityId, planId, paymentMethod);
      if (!validation.isValid) {
        setError(validation.error);
        return false;
      }
      
      // Generate payment ID for demo purposes
      const paymentId = generateDemoPaymentId();
      
      // Always generate a new invite link for new payments
      logPaymentAction('Generating fresh invite link for this payment');
      console.log(`[usePaymentHandler] Generating invite link for community: ${communityId}`);
      const currentInviteLink = await fetchOrCreateInviteLink(communityId, true);
      
      if (!currentInviteLink) {
        console.warn('[usePaymentHandler] Could not generate a fresh invite link, will try to use existing one');
      } else {
        console.log(`[usePaymentHandler] Generated invite link: ${currentInviteLink}`);
      }
      
      // Use the new or existing invite link
      const linkToUse = currentInviteLink || inviteLink;
      console.log(`[usePaymentHandler] Using invite link: ${linkToUse}`);
      
      // Fetch plan details for subscription dates calculation
      const planDetails = await fetchPlanDetails(planId);
      
      // Record the payment
      const { success: paymentRecorded, inviteLink: updatedInviteLink, error: paymentError } = await recordPayment({
        telegramUserId: telegramUserId!,
        communityId,
        planId,
        planPrice: planDetails?.price || 0,
        paymentMethod,
        inviteLink: linkToUse,
        username: telegramUsername
      });

      if (!paymentRecorded) {
        console.error(`[usePaymentHandler] Payment recording failed: ${paymentError}`);
        throw new Error(paymentError || "Failed to record payment");
      }

      console.log(`[usePaymentHandler] Payment recorded successfully.`);
      
      // Finalize the payment by updating membership status
      return await finalizePayment(paymentId, updatedInviteLink || linkToUse, planDetails);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment processing failed";
      console.error("[usePaymentHandler] Payment processing error:", errorMessage);
      console.error("[usePaymentHandler] Full error details:", err);
      setError(errorMessage);
      createPaymentToast(false, null, errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    processPaymentWithMethod,
    isLoading,
    error,
    setError
  };
};
