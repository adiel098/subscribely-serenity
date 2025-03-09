
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useInviteLink } from "./useInviteLink";
import { useMembershipUpdate } from "./useMembershipUpdate";
import { usePaymentRecord } from "./usePaymentRecord";
import { validatePaymentParams, logPaymentAction } from "./utils";
import { supabase } from "@/integrations/supabase/client";

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
    console.log('[usePaymentProcessing] Starting payment processing');
    console.log(`[usePaymentProcessing] Parameters:
      - communityId: ${communityId}, type: ${typeof communityId}
      - planId: ${planId}, type: ${typeof planId}
      - planPrice: ${planPrice}, type: ${typeof planPrice}
      - telegramUserId: ${telegramUserId}, type: ${typeof telegramUserId}
      - telegramUsername: ${telegramUsername}, type: ${typeof telegramUsername}
      - paymentMethod: ${paymentMethod}, type: ${typeof paymentMethod}
      - communityInviteLink: ${communityInviteLink}, type: ${typeof communityInviteLink}
    `);
    
    // Validate required parameters
    const validation = validatePaymentParams(telegramUserId, communityId, planId);
    if (!validation.isValid) {
      console.error(`[usePaymentProcessing] Validation failed: ${validation.error}`);
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
        currentInviteLink: inviteLink,
        planPrice
      });
      
      const paymentId = `demo-${Date.now()}`;
      console.log(`[usePaymentProcessing] Generated payment ID: ${paymentId}`);
      
      // Always generate a new invite link for new payments
      logPaymentAction('Generating fresh invite link for this payment');
      console.log(`[usePaymentProcessing] Generating invite link for community: ${communityId}`);
      const currentInviteLink = await fetchOrCreateInviteLink(communityId, true);
      
      if (!currentInviteLink) {
        console.warn('[usePaymentProcessing] Could not generate a fresh invite link, will try to use existing one');
      } else {
        console.log(`[usePaymentProcessing] Generated invite link: ${currentInviteLink}`);
      }
      
      // Use the new or existing invite link
      const linkToUse = currentInviteLink || inviteLink;
      console.log(`[usePaymentProcessing] Using invite link: ${linkToUse}`);
      
      // Fetch plan details for subscription dates calculation
      console.log('[usePaymentProcessing] Fetching plan details for subscription dates calculation');
      const { data: planDetails, error: planError } = await supabase
        .from('subscription_plans')
        .select('interval, price')
        .eq('id', planId)
        .single();
        
      if (planError) {
        console.warn('[usePaymentProcessing] Error fetching plan details:', planError);
        // Continue without plan details
      } else {
        console.log('[usePaymentProcessing] Retrieved plan details:', planDetails);
      }
      
      // Record the payment
      console.log('[usePaymentProcessing] Recording payment with params:', {
        telegramUserId: telegramUserId!,
        communityId,
        planId,
        planPrice,
        paymentMethod,
        inviteLink: linkToUse,
        username: telegramUsername
      });
      
      const { success: paymentRecorded, inviteLink: updatedInviteLink, error: paymentError } = await recordPayment({
        telegramUserId: telegramUserId!,
        communityId,
        planId,
        planPrice,
        paymentMethod,
        inviteLink: linkToUse,
        username: telegramUsername
      });

      if (!paymentRecorded) {
        console.error(`[usePaymentProcessing] Payment recording failed: ${paymentError}`);
        throw new Error(paymentError || "Failed to record payment");
      }

      console.log(`[usePaymentProcessing] Payment recorded successfully. Updating membership status IMMEDIATELY after payment.`);

      // Update membership status - THIS WILL IMMEDIATELY CREATE A MEMBER RECORD WITH SUBSCRIPTION DETAILS
      console.log('[usePaymentProcessing] Updating membership with params:', {
        telegramUserId: telegramUserId!,
        communityId,
        planId,
        paymentId,
        username: telegramUsername,
        planDetails
      });
      
      const membershipUpdated = await updateMembershipStatus({
        telegramUserId: telegramUserId!,
        communityId,
        planId,
        paymentId,
        username: telegramUsername,
        planDetails
      });

      if (!membershipUpdated) {
        console.error(`[usePaymentProcessing] Membership update failed.`);
        throw new Error("Failed to update membership status");
      }

      console.log(`[usePaymentProcessing] Membership updated successfully with subscription details.`);

      // Final check for invite link - if still not available, try once more
      if (!linkToUse) {
        logPaymentAction("Payment successful but still no invite link available!");
        
        // Last attempt - try the edge function again with force new parameter
        try {
          console.log('[usePaymentProcessing] Making final attempt to create invite link with forceNew=true');
          await fetchOrCreateInviteLink(communityId, true);
        } catch (err) {
          console.error("[usePaymentProcessing] Final attempt to create invite link failed:", err);
        }
      }

      setIsSuccess(true);
      console.log(`[usePaymentProcessing] Payment process completed successfully.`);
      
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
      console.error("[usePaymentProcessing] Full error details:", err);
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
