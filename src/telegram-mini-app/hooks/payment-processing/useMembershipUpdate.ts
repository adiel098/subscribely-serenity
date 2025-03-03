
import { supabase } from "@/integrations/supabase/client";
import { logPaymentAction } from "./utils";

interface MembershipUpdateParams {
  telegramUserId: string;
  communityId: string;
  planId: string;
  paymentId?: string;
  username?: string;
}

/**
 * Hook for updating membership status after successful payment
 */
export const useMembershipUpdate = () => {
  /**
   * Update membership status in the database
   */
  const updateMembershipStatus = async (params: MembershipUpdateParams) => {
    const { telegramUserId, communityId, planId, paymentId, username } = params;
    
    logPaymentAction('Updating membership status', params);
    
    try {
      // Prepare data object for creating or updating membership
      const memberData = {
        telegram_id: telegramUserId,
        community_id: communityId,
        subscription_plan_id: planId,
        status: 'active',
        payment_id: paymentId,
        username: username
      };
      
      // Call the edge function to create or update the member record
      const { data, error } = await supabase.functions.invoke('telegram-user-manager', {
        body: {
          action: "create_or_update_member",
          ...memberData
        }
      });

      if (error) {
        console.error("[useMembershipUpdate] Error updating membership:", error);
        throw new Error(`Membership update failed: ${error.message}`);
      }

      logPaymentAction('Membership status updated successfully', data);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error updating membership";
      console.error("[useMembershipUpdate] Error:", errorMessage);
      return false;
    }
  };

  return {
    updateMembershipStatus
  };
};
