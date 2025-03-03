
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
    console.log('usePaymentProcessing - Initial community invite link:', communityInviteLink);
    if (communityInviteLink) {
      setInviteLink(communityInviteLink);
    }
  }, [communityInviteLink]);

  const processPayment = async (paymentMethod: string) => {
    if (!telegramUserId) {
      setError("User ID not found. Please try again later.");
      return false;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Processing payment for plan ${planId} with ${paymentMethod}`);
      console.log('Community ID:', communityId);
      console.log('Telegram User ID:', telegramUserId);
      console.log('Current Community Invite Link:', inviteLink);
      
      const paymentId = `demo-${Date.now()}`;
      
      // First, try to get the community invite link if it's not already available
      if (!inviteLink) {
        console.log('No invite link available. Attempting to fetch from database...');
        try {
          const { data: communityData, error: communityError } = await supabase
            .from('communities')
            .select('telegram_invite_link')
            .eq('id', communityId)
            .single();
            
          if (communityError) {
            console.error('Error fetching community:', communityError);
          } else if (communityData?.telegram_invite_link) {
            console.log('Retrieved invite link from database:', communityData.telegram_invite_link);
            setInviteLink(communityData.telegram_invite_link);
          } else {
            console.warn('No invite link found in database');
          }
        } catch (err) {
          console.error("Error fetching invite link:", err);
        }
      }
      
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
          invite_link: inviteLink
        })
        .select()
        .single();

      if (paymentError) {
        console.error("Error recording payment:", paymentError);
        throw new Error(`Payment recording failed: ${paymentError.message}`);
      }

      console.log('Payment recorded successfully:', paymentData);
      
      // If we got the invite link from the payment response, use it
      if (paymentData?.invite_link && !inviteLink) {
        console.log('Got invite link from payment record:', paymentData.invite_link);
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

      // Final check and attempt for invite link if still not available
      if (!inviteLink) {
        console.warn("Payment successful but still no invite link available!");
        
        // Last attempt - check if we can get it from the edge function
        try {
          const response = await supabase.functions.invoke("telegram-community-data", {
            body: { community_id: communityId, debug: true }
          });
          
          if (response.data?.community?.telegram_invite_link) {
            console.log('Retrieved invite link from edge function:', response.data.community.telegram_invite_link);
            setInviteLink(response.data.community.telegram_invite_link);
          }
        } catch (err) {
          console.error("Error fetching invite link from edge function:", err);
        }
      }

      setIsSuccess(true);
      toast({
        title: "Payment Successful",
        description: inviteLink 
          ? "Thank you for your payment. You can now join the community." 
          : "Payment successful, but no invite link is available. Please contact support.",
      });
      onSuccess?.();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment processing failed";
      console.error("Payment processing error:", errorMessage);
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
