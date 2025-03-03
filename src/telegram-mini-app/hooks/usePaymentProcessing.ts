
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { createOrUpdateMember } from "@/telegram-mini-app/services/memberService";
import { toast } from "@/components/ui/use-toast";

interface UsePaymentProcessingOptions {
  communityId: string;
  planId: string;
  communityInviteLink: string | null;
  telegramUserId?: string;
  onSuccess?: () => void;
}

export const usePaymentProcessing = ({
  communityId,
  planId,
  communityInviteLink,
  telegramUserId,
  onSuccess
}: UsePaymentProcessingOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(communityInviteLink);

  // Log the invite link for debugging
  useEffect(() => {
    console.log('[usePaymentProcessing] Initial community invite link:', communityInviteLink);
    if (communityInviteLink) {
      setInviteLink(communityInviteLink);
    }
  }, [communityInviteLink]);

  // Function to fetch or create an invite link
  const fetchOrCreateInviteLink = async (forceNew = false) => {
    console.log('[usePaymentProcessing] Attempting to fetch or create invite link, forceNew:', forceNew);
    try {
      if (!forceNew) {
        // First try to get the invite link from the community record
        const { data: community, error: communityError } = await supabase
          .from('communities')
          .select('telegram_invite_link')
          .eq('id', communityId)
          .single();
        
        if (communityError) {
          console.error('[usePaymentProcessing] Error fetching community:', communityError);
        } else if (community?.telegram_invite_link) {
          console.log('[usePaymentProcessing] Found invite link in community record:', community.telegram_invite_link);
          setInviteLink(community.telegram_invite_link);
          return community.telegram_invite_link;
        }
      }
      
      // If no invite link was found or forceNew is true, try to create one using the edge function
      console.log('[usePaymentProcessing] Calling create-invite-link function with forceNew:', forceNew);
      const { data, error } = await supabase.functions.invoke('create-invite-link', {
        body: { communityId, forceNew }
      });
      
      if (error) {
        console.error('[usePaymentProcessing] Error calling create-invite-link function:', error);
        throw new Error(`Failed to create invite link: ${error.message}`);
      }
      
      if (data?.inviteLink) {
        console.log('[usePaymentProcessing] Successfully created invite link:', data.inviteLink);
        setInviteLink(data.inviteLink);
        return data.inviteLink;
      } else {
        console.error('[usePaymentProcessing] No invite link returned from function:', data);
        throw new Error('No invite link returned from function');
      }
    } catch (err) {
      console.error('[usePaymentProcessing] Error in fetchOrCreateInviteLink:', err);
      return null;
    }
  };

  const processPayment = async (paymentMethod: string) => {
    if (!telegramUserId) {
      setError("User ID not found. Please try again later.");
      return false;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[usePaymentProcessing] Processing payment for plan ${planId} with ${paymentMethod}`);
      console.log('[usePaymentProcessing] Community ID:', communityId);
      console.log('[usePaymentProcessing] Telegram User ID:', telegramUserId);
      console.log('[usePaymentProcessing] Current Community Invite Link:', inviteLink);
      
      const paymentId = `demo-${Date.now()}`;
      
      // Always generate a new invite link for new payments
      console.log('[usePaymentProcessing] Generating fresh invite link for this payment...');
      const currentInviteLink = await fetchOrCreateInviteLink(true);
      
      if (!currentInviteLink) {
        console.warn('[usePaymentProcessing] Could not generate a fresh invite link, will try to use existing one');
      }
      
      // Use the new or existing invite link
      const linkToUse = currentInviteLink || inviteLink;
      
      // Log the payment to the database with the current invite link
      const { data: paymentData, error: paymentError } = await supabase
        .from('subscription_payments')
        .insert({
          telegram_user_id: telegramUserId,
          community_id: communityId,
          plan_id: planId,
          payment_method: paymentMethod,
          amount: 0, // This would be the actual amount in a real implementation
          status: 'successful',
          invite_link: linkToUse
        })
        .select()
        .single();

      if (paymentError) {
        console.error("[usePaymentProcessing] Error recording payment:", paymentError);
        throw new Error(`Payment recording failed: ${paymentError.message}`);
      }

      console.log('[usePaymentProcessing] Payment recorded successfully:', paymentData);
      
      // If we got the invite link from the payment response, use it
      if (paymentData?.invite_link) {
        console.log('[usePaymentProcessing] Got invite link from payment record:', paymentData.invite_link);
        setInviteLink(paymentData.invite_link);
      }

      // Update or create member status
      const success = await createOrUpdateMember({
        telegram_id: telegramUserId,
        community_id: communityId,
        subscription_plan_id: planId,
        status: 'active',
        payment_id: paymentId
      });

      if (!success) {
        throw new Error("Failed to update membership status");
      }

      // Final check for invite link - if still not available, try once more
      if (!linkToUse) {
        console.warn("[usePaymentProcessing] Payment successful but still no invite link available!");
        
        // Last attempt - try the edge function again with force new parameter
        try {
          console.log('[usePaymentProcessing] Making final attempt to create invite link with forceNew=true');
          const link = await fetchOrCreateInviteLink(true);
          if (link) {
            setInviteLink(link);
          }
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
      console.log('[usePaymentProcessing] Final invite link state:', linkToUse || inviteLink);
      
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
