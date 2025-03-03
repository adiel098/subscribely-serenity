
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useInviteLink } from "./useInviteLink";
import { useMembershipUpdate } from "./useMembershipUpdate";
import { usePaymentRecord } from "./usePaymentRecord";
import { validatePaymentParams, logPaymentAction } from "./utils";

interface UsePaymentProcessingOptions {
  communityId: string;
  planId: string;
  communityInviteLink: string | null;
  telegramUserId?: string;
  telegramUsername?: string;
  onSuccess?: () => void;
}

export const usePaymentProcessing = ({
  communityId,
  planId,
  communityInviteLink,
  telegramUserId,
  telegramUsername,
  onSuccess
}: UsePaymentProcessingOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Use the invite link hook
  const { inviteLink, fetchOrCreateInviteLink } = useInviteLink(communityInviteLink);
  
  // Use the membership update hook
  const { updateMembershipStatus } = useMembershipUpdate();
  
  // Use the payment record hook
  const { recordPayment } = usePaymentRecord();

  const processPayment = async (paymentMethod: string) => {
    // Validate required parameters
    const validation = validatePaymentParams(telegramUserId, communityId, planId);
    if (!validation.isValid) {
      setError(validation.error);
      return false;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      logPaymentAction(`Processing payment for plan ${planId}`, { 
        paymentMethod,
        communityId,
        telegramUserId,
        telegramUsername,
        currentInviteLink: inviteLink
      });
      
      const paymentId = `demo-${Date.now()}`;
      
      // Always generate a new invite link for new payments
      logPaymentAction('Generating fresh invite link for this payment');
      const currentInviteLink = await fetchOrCreateInviteLink(communityId, true);
      
      if (!currentInviteLink) {
        console.warn('[usePaymentProcessing] Could not generate a fresh invite link, will try to use existing one');
      }
      
      // Use the new or existing invite link
      const linkToUse = currentInviteLink || inviteLink;
      
      // Record the payment
      const { success: paymentRecorded, inviteLink: updatedInviteLink } = await recordPayment({
        telegramUserId: telegramUserId!,
        communityId,
        planId,
        paymentMethod,
        inviteLink: linkToUse,
        username: telegramUsername
      });

      if (!paymentRecorded) {
        throw new Error("Failed to record payment");
      }

      // Update membership status
      const membershipUpdated = await updateMembershipStatus({
        telegramUserId: telegramUserId!,
        communityId,
        planId,
        paymentId,
        username: telegramUsername
      });

      if (!membershipUpdated) {
        throw new Error("Failed to update membership status");
      }

      // Final check for invite link - if still not available, try once more
      if (!linkToUse) {
        logPaymentAction("Payment successful but still no invite link available!");
        
        // Last attempt - try the edge function again with force new parameter
        try {
          logPaymentAction('Making final attempt to create invite link with forceNew=true');
          await fetchOrCreateInviteLink(communityId, true);
        } catch (err) {
          console.error("[usePaymentProcessing] Final attempt to create invite link failed:", err);
        }
      }

      setIsSuccess(true);
      toast({
        title: "Payment Successful",
        description: linkToUse 
          ? "Thank you for your payment. You can now join the community." 
          : "Payment successful, but no invite link is available. Please contact support.",
      });
      
      // Log final state before completing
      logPaymentAction('Payment processing completed successfully', { inviteLink: linkToUse });
      
      onSuccess?.();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment processing failed";
      console.error("[usePaymentProcessing] Payment processing error:", errorMessage);
      setError(errorMessage);
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setIsLoading(false);
    setError(null);
    setIsSuccess(false);
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
