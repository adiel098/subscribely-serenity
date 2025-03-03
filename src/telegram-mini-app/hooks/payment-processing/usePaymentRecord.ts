
import { supabase } from "@/integrations/supabase/client";
import { logPaymentAction, logSubscriptionActivity } from "./utils";

interface RecordPaymentParams {
  telegramUserId: string;
  communityId: string;
  planId: string;
  paymentMethod: string;
  inviteLink: string | null;
  username?: string;
}

/**
 * Hook for recording payment details in the database
 */
export const usePaymentRecord = () => {
  /**
   * Record payment information in the database
   */
  const recordPayment = async (params: RecordPaymentParams) => {
    const { telegramUserId, communityId, planId, paymentMethod, inviteLink, username } = params;
    
    logPaymentAction('Recording payment with params', params);
    console.log('[usePaymentRecord] Recording payment with params:', JSON.stringify(params, null, 2));
    
    try {
      // Log all parameters for debugging
      console.log('[usePaymentRecord] Payment parameters:');
      console.log(`- telegramUserId: ${telegramUserId}, type: ${typeof telegramUserId}`);
      console.log(`- communityId: ${communityId}, type: ${typeof communityId}`);
      console.log(`- planId: ${planId}, type: ${typeof planId}`);
      console.log(`- paymentMethod: ${paymentMethod}, type: ${typeof paymentMethod}`);
      console.log(`- inviteLink: ${inviteLink}, type: ${typeof inviteLink}`);
      console.log(`- username: ${username}, type: ${typeof username}`);
      
      // Get plan details to record accurate amount
      console.log('[usePaymentRecord] Fetching plan details for planId:', planId);
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('price')
        .eq('id', planId)
        .single();
        
      if (planError) {
        console.error("[usePaymentRecord] Error fetching plan details:", planError);
        console.log("[usePaymentRecord] Plan error details:", JSON.stringify(planError, null, 2));
      }
      
      const price = planData?.price || 0;
      console.log(`[usePaymentRecord] Retrieved price: ${price} for plan ${planId}`);
      
      // Prepare payment data object for logging and insertion
      const paymentData = {
        telegram_user_id: telegramUserId,
        community_id: communityId,
        plan_id: planId,
        payment_method: paymentMethod,
        amount: price,
        status: 'successful',
        invite_link: inviteLink,
        telegram_username: username
      };
      
      console.log('[usePaymentRecord] Inserting payment record with data:', JSON.stringify(paymentData, null, 2));
      
      // Log the payment to the database with the current invite link
      const { data, error: paymentError } = await supabase
        .from('subscription_payments')
        .insert(paymentData)
        .select()
        .single();

      if (paymentError) {
        console.error("[usePaymentRecord] Error recording payment:", paymentError);
        console.log("[usePaymentRecord] Payment error details:", JSON.stringify(paymentError, null, 2));
        console.log("[usePaymentRecord] Payment data that caused error:", JSON.stringify(paymentData, null, 2));
        throw new Error(`Payment recording failed: ${paymentError.message}`);
      }

      console.log('[usePaymentRecord] Payment recorded successfully:', JSON.stringify(data, null, 2));

      // Log payment activity
      await logSubscriptionActivity(
        telegramUserId,
        communityId,
        'payment_received',
        `Method: ${paymentMethod}, Amount: ${price}, Plan ID: ${planId}`
      );

      logPaymentAction('Payment recorded successfully', data);
      
      // Return the recorded payment data, including any updated invite link
      return { 
        success: true, 
        paymentData: data,
        inviteLink: data?.invite_link || inviteLink 
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error recording payment";
      console.error("[usePaymentRecord] Error:", errorMessage);
      console.error("[usePaymentRecord] Error details:", err);
      return { success: false, error: errorMessage };
    }
  };

  return {
    recordPayment
  };
};
