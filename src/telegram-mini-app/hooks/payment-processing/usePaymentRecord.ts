
import { supabase } from "@/integrations/supabase/client";
import { logPaymentAction, logSubscriptionActivity } from "./utils";

interface RecordPaymentParams {
  telegramUserId: string;
  communityId: string;
  planId: string;
  planPrice: number;
  paymentMethod: string;
  inviteLink: string | null;
  username?: string;
  firstName?: string;  // Add first name
  lastName?: string;   // Add last name
}

/**
 * Hook for recording payment details in the database
 */
export const usePaymentRecord = () => {
  /**
   * Record payment information in the database
   */
  const recordPayment = async (params: RecordPaymentParams) => {
    const { 
      telegramUserId, 
      communityId, 
      planId, 
      planPrice, 
      paymentMethod, 
      inviteLink, 
      username,
      firstName,
      lastName
    } = params;
    
    logPaymentAction('Recording payment with params', params);
    console.log('[usePaymentRecord] Recording payment with params:', JSON.stringify(params, null, 2));
    
    try {
      // Log all parameters for debugging
      console.log('[usePaymentRecord] Payment parameters:');
      console.log(`- telegramUserId: ${telegramUserId}, type: ${typeof telegramUserId}`);
      console.log(`- communityId: ${communityId}, type: ${typeof communityId}`);
      console.log(`- planId: ${planId}, type: ${typeof planId}`);
      console.log(`- planPrice: ${planPrice}, type: ${typeof planPrice}`);
      console.log(`- paymentMethod: ${paymentMethod}, type: ${typeof paymentMethod}`);
      console.log(`- inviteLink: ${inviteLink}, type: ${typeof inviteLink}`);
      console.log(`- username: ${username}, type: ${typeof username}`);
      console.log(`- firstName: ${firstName}, type: ${typeof firstName}`);
      console.log(`- lastName: ${lastName}, type: ${typeof lastName}`);
      
      // Use the provided plan price directly
      const price = planPrice;
      console.log(`[usePaymentRecord] Using provided price: ${price} for plan ${planId}`);
      
      // Verify planId is valid and exists in the database
      if (!planId) {
        console.warn('[usePaymentRecord] WARNING: planId is empty or undefined! This will cause "Unknown Plan" in history.');
      } else {
        // Verify the plan exists and log its details
        const { data: planDetails, error: planCheckError } = await supabase
          .from('subscription_plans')
          .select('id, name, price')
          .eq('id', planId)
          .single();
        
        if (planCheckError) {
          console.warn(`[usePaymentRecord] Warning: Could not verify plan ${planId} exists:`, planCheckError);
        } else if (!planDetails) {
          console.warn(`[usePaymentRecord] WARNING: Plan ${planId} does not exist in database! This will cause "Unknown Plan" in history.`);
        } else {
          console.log(`[usePaymentRecord] Verified plan exists:`, {
            planExists: true,
            planDetails,
            planError: planCheckError
          });
          
          // Check for other payments using this plan to confirm it's properly linked
          const { data: planPayments, error: planPaymentsError } = await supabase
            .from('subscription_payments')
            .select('id, created_at, status')
            .eq('plan_id', planId)
            .limit(5);
            
          console.log(`[usePaymentRecord] Plan association check:`, {
            associatedPayments: planPayments,
            paymentCount: planPayments?.length || 0,
            planPaymentsError
          });
        }
      }
      
      // Prepare payment data object for logging and insertion
      const paymentData = {
        telegram_user_id: telegramUserId,
        community_id: communityId,
        plan_id: planId,
        payment_method: paymentMethod,
        amount: price,
        status: 'successful',
        invite_link: inviteLink,
        telegram_username: username,
        first_name: firstName || '', // Include first name
        last_name: lastName || ''     // Include last name
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
