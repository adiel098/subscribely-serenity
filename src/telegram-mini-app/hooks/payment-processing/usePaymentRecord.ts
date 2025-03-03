
import { supabase } from "@/integrations/supabase/client";
import { logPaymentAction, logSubscriptionActivity } from "./utils";

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
      // Get plan details to record accurate amount
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('price')
        .eq('id', planId)
        .single();
        
      if (planError) {
        console.error("[usePaymentRecord] Error fetching plan details:", planError);
      }
      
      const price = planData?.price || 0;
      
      // Log the payment to the database with the current invite link
      const { data: paymentData, error: paymentError } = await supabase
        .from('subscription_payments')
        .insert({
          telegram_user_id: telegramUserId,
          community_id: communityId,
          plan_id: planId,
          payment_method: paymentMethod,
          amount: price,
          status: 'successful',
          invite_link: inviteLink
        })
        .select()
        .single();

      if (paymentError) {
        console.error("[usePaymentRecord] Error recording payment:", paymentError);
        throw new Error(`Payment recording failed: ${paymentError.message}`);
      }

      // Log payment activity
      await logSubscriptionActivity(
        telegramUserId,
        communityId,
        'payment_received',
        `Method: ${paymentMethod}, Amount: ${price}, Plan ID: ${planId}`
      );

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
