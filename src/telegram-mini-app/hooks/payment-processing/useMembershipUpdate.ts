
import { supabase } from "@/integrations/supabase/client";
import { createOrUpdateMember } from "@/telegram-mini-app/services/memberService";
import { logPaymentAction, logSubscriptionActivity } from "./utils";

interface MembershipUpdateParams {
  telegramUserId: string;
  communityId: string;
  planId: string;
  paymentId: string;
}

/**
 * Hook for handling membership status updates
 */
export const useMembershipUpdate = () => {
  /**
   * Update or create membership after successful payment
   */
  const updateMembershipStatus = async (params: MembershipUpdateParams): Promise<boolean> => {
    const { telegramUserId, communityId, planId, paymentId } = params;
    
    logPaymentAction('Updating membership status', params);
    
    try {
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
      
      // Log the membership update activity
      await logSubscriptionActivity(
        telegramUserId,
        communityId,
        'subscription_renewed',
        `Plan ID: ${planId}, Payment ID: ${paymentId}`
      );
      
      logPaymentAction('Membership status updated successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error updating membership";
      console.error(`[useMembershipUpdate] Error:`, errorMessage);
      return false;
    }
  };

  return {
    updateMembershipStatus
  };
};
