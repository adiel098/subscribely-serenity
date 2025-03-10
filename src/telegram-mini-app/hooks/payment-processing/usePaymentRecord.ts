
import { supabase } from "@/integrations/supabase/client";
import { logPaymentAction, logSubscriptionActivity } from "./utils";
import { Subscription } from "@/telegram-mini-app/services/memberService";

interface RecordPaymentParams {
  telegramUserId: string;
  communityId: string;
  planId: string;
  planPrice: number;
  paymentMethod: string;
  inviteLink: string | null;
  username?: string;
  firstName?: string;
  lastName?: string;
  activeSubscription?: Subscription | null;
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
      lastName,
      activeSubscription
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
          .select('id, name, price, interval')
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
        first_name: firstName || '', 
        last_name: lastName || ''
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

      // Prepare start and end dates for subscription
      const startDate = new Date();
      let endDate = new Date();
      
      // Add any remaining days from an existing subscription
      if (activeSubscription && activeSubscription.subscription_end_date) {
        const currentEndDate = new Date(activeSubscription.subscription_end_date);
        if (currentEndDate > startDate) {
          const remainingMs = currentEndDate.getTime() - startDate.getTime();
          const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
          console.log(`[usePaymentRecord] Adding ${remainingDays} days from existing subscription`);
          endDate.setDate(endDate.getDate() + remainingDays);
        }
      }
      
      // Get plan details for duration calculation
      const { data: planData } = await supabase
        .from('subscription_plans')
        .select('interval')
        .eq('id', planId)
        .maybeSingle();
        
      // Calculate end date based on plan interval
      if (planData?.interval) {
        const interval = planData.interval;
        
        if (interval === 'monthly') {
          endDate.setMonth(endDate.getMonth() + 1);
        } else if (interval === 'yearly') {
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else if (interval === 'quarterly') {
          endDate.setMonth(endDate.getMonth() + 3);
        } else if (interval === 'half-yearly') {
          endDate.setMonth(endDate.getMonth() + 6);
        } else if (interval === 'one_time') {
          endDate.setFullYear(endDate.getFullYear() + 1); // Default 1 year for one-time
        }
      } else {
        // Default to 30 days if no interval found
        endDate.setDate(endDate.getDate() + 30);
      }
      
      console.log(`[usePaymentRecord] Calculated subscription end date: ${endDate.toISOString()}`);
      
      // Create member data object
      const memberData = {
        telegram_user_id: telegramUserId,
        telegram_username: username || null,
        community_id: communityId,
        subscription_plan_id: planId,
        subscription_start_date: startDate.toISOString(),
        subscription_end_date: endDate.toISOString(),
        subscription_status: 'active',
        is_active: true,
        joined_at: new Date().toISOString(),
        first_name: firstName || null,
        last_name: lastName || null
      };
      
      console.log('[usePaymentRecord] Creating/updating member record with data:', JSON.stringify(memberData, null, 2));
      
      // Check if member already exists
      const { data: existingMember, error: memberError } = await supabase
        .from('telegram_chat_members')
        .select('id')
        .eq('telegram_user_id', telegramUserId)
        .eq('community_id', communityId)
        .maybeSingle();

      if (memberError) {
        console.warn('[usePaymentRecord] Error checking for existing member:', memberError);
      }
      
      let memberId;
      
      // Create or update the member record
      if (existingMember?.id) {
        console.log('[usePaymentRecord] Updating existing member with ID:', existingMember.id);
        
        const { data: updatedMember, error: updateError } = await supabase
          .from('telegram_chat_members')
          .update(memberData)
          .eq('id', existingMember.id)
          .select('id')
          .single();
          
        if (updateError) {
          console.error('[usePaymentRecord] Error updating member:', updateError);
        } else {
          console.log('[usePaymentRecord] Member updated successfully');
          memberId = updatedMember.id;
        }
      } else {
        console.log('[usePaymentRecord] Creating new member record');
        
        const { data: newMember, error: insertError } = await supabase
          .from('telegram_chat_members')
          .insert(memberData)
          .select('id')
          .single();
          
        if (insertError) {
          console.error('[usePaymentRecord] Error creating member:', insertError);
        } else {
          console.log('[usePaymentRecord] Member created successfully');
          memberId = newMember.id;
        }
      }

      // Log payment activity
      await logSubscriptionActivity(
        telegramUserId,
        communityId,
        'payment_received',
        `Method: ${paymentMethod}, Amount: ${price}, Plan ID: ${planId}`
      );

      // Log membership activity
      await logSubscriptionActivity(
        telegramUserId,
        communityId,
        'member_added',
        `Member added after payment. Plan: ${planId}, Payment ID: ${data?.id}`
      );

      logPaymentAction('Payment recorded successfully', data);
      
      // Return the recorded payment data, including any updated invite link
      return { 
        success: true, 
        paymentData: data,
        inviteLink: data?.invite_link || inviteLink,
        memberId
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
