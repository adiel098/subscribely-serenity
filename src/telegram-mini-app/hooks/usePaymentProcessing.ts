
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

  // Log the invite link for debugging
  useEffect(() => {
    console.log('usePaymentProcessing - Community invite link:', communityInviteLink);
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
      console.log('Community Invite Link:', communityInviteLink);
      
      const paymentId = `demo-${Date.now()}`;
      
      // In a real app, this would involve Stripe, PayPal, etc.
      // For now, we'll just simulate a successful payment
      
      // Log the payment to the database
      const { error: paymentError } = await supabase
        .from('subscription_payments')
        .insert({
          telegram_user_id: telegramUserId,
          community_id: communityId,
          plan_id: planId,
          payment_method: paymentMethod,
          amount: 0, // This would be the actual amount in a real implementation
          status: 'successful',
          invite_link: communityInviteLink
        });

      if (paymentError) {
        console.error("Error recording payment:", paymentError);
        throw new Error(`Payment recording failed: ${paymentError.message}`);
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

      // Final check for invite link
      if (!communityInviteLink) {
        console.warn("Payment successful but no invite link available!");
        // Attempt to fetch the invite link if it wasn't provided
        try {
          const { data } = await supabase
            .from('communities')
            .select('telegram_invite_link')
            .eq('id', communityId)
            .single();
            
          if (data?.telegram_invite_link) {
            console.log('Retrieved invite link from database:', data.telegram_invite_link);
            // We can't update the communityInviteLink directly since it's a prop
            // But we'll log it for debugging
          }
        } catch (err) {
          console.error("Error fetching invite link:", err);
        }
      }

      setIsSuccess(true);
      toast({
        title: "Payment Successful",
        description: "Thank you for your payment. You can now join the community.",
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
    resetState
  };
};
