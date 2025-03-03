
import { supabase } from "@/integrations/supabase/client";
import { logPaymentAction } from "./utils";

interface RecordPaymentParams {
  telegramUserId: string;
  communityId: string;
  planId: string;
  paymentMethod: string;
  inviteLink: string | null;
}

/**
 * Hook for recording payment details in the database
 */
export const usePaymentRecord = () => {
  /**
   * Record payment information in the database
   */
  const recordPayment = async (params: RecordPaymentParams) => {
    const { telegramUserId, communityId, planId, paymentMethod, inviteLink } = params;
    
    logPaymentAction('Recording payment', params);
    
    try {
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
        console.error("[usePaymentRecord] Error recording payment:", paymentError);
        throw new Error(`Payment recording failed: ${paymentError.message}`);
      }

      logPaymentAction('Payment recorded successfully', paymentData);
      
      // Return the recorded payment data, including any updated invite link
      return { 
        success: true, 
        paymentData,
        inviteLink: paymentData?.invite_link || inviteLink 
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error recording payment";
      console.error("[usePaymentRecord] Error:", errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    recordPayment
  };
};
