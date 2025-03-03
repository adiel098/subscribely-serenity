
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
    
    if (!telegramUserId || !communityId || !planId) {
      console.error('[useMembershipUpdate] Missing required parameters:', JSON.stringify({
        telegramUserId,
        communityId,
        planId
      }));
      return false;
    }
    
    logPaymentAction('Updating membership status', params);
    console.log('[useMembershipUpdate] Updating membership with params:', JSON.stringify(params, null, 2));
    
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
      
      console.log('[useMembershipUpdate] Calling edge function with data:', JSON.stringify(memberData, null, 2));
      
      // Call the edge function to create or update the member record
      const { data, error } = await supabase.functions.invoke('telegram-user-manager', {
        body: {
          action: "create_or_update_member",
          ...memberData
        }
      });

      if (error) {
        console.error("[useMembershipUpdate] Error updating membership:", error);
        console.log("[useMembershipUpdate] Error details:", JSON.stringify(error, null, 2));
        console.log("[useMembershipUpdate] Request data that caused error:", JSON.stringify(memberData, null, 2));
        throw new Error(`Membership update failed: ${error.message}`);
      }

      console.log('[useMembershipUpdate] Membership update response:', JSON.stringify(data, null, 2));
      logPaymentAction('Membership status updated successfully', data);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error updating membership";
      console.error("[useMembershipUpdate] Error:", errorMessage);
      console.error("[useMembershipUpdate] Full error details:", err);
      return false;
    }
  };

  return {
    updateMembershipStatus
  };
};
