
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plan } from "@/telegram-mini-app/types/community.types";
import { createOrUpdateMember } from "@/telegram-mini-app/services/memberService";

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

  const processPayment = async (paymentMethod: string) => {
    if (!telegramUserId) {
      setError("User ID not found. Please try again later.");
      return false;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Processing payment for plan ${planId} with ${paymentMethod}`);
      
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

      setIsSuccess(true);
      onSuccess?.();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Payment processing failed";
      console.error("Payment processing error:", errorMessage);
      setError(errorMessage);
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
