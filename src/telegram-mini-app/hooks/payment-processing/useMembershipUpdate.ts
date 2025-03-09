
import { supabase } from "@/integrations/supabase/client";
import { createOrUpdateMember } from "@/telegram-mini-app/services/memberService";

interface MembershipUpdateParams {
  telegramUserId: string;
  communityId: string;
  planId: string;
  paymentId?: string;
  username?: string;
}

export const useMembershipUpdate = () => {
  const updateMembershipStatus = async ({
    telegramUserId,
    communityId,
    planId,
    paymentId,
    username
  }: MembershipUpdateParams): Promise<boolean> => {
    console.log('[useMembershipUpdate] Starting membership update with params:', {
      telegramUserId,
      communityId,
      planId,
      paymentId,
      username
    });

    try {
      // Immediately create/update member record in telegram_chat_members
      const membershipResult = await createOrUpdateMember({
        telegram_id: telegramUserId,
        community_id: communityId,
        subscription_plan_id: planId,
        status: 'active',
        payment_id: paymentId,
        username
      });

      if (!membershipResult) {
        console.error('[useMembershipUpdate] Failed to create/update member record');
        return false;
      }

      console.log('[useMembershipUpdate] Successfully created/updated member record');
      
      // Log the subscription activity
      const { error: logError } = await supabase
        .from('subscription_activity_logs')
        .insert({
          telegram_user_id: telegramUserId,
          community_id: communityId,
          activity_type: 'subscription_created',
          details: `Plan: ${planId}, Payment: ${paymentId || 'N/A'}`
        });

      if (logError) {
        console.error('[useMembershipUpdate] Error logging subscription activity:', logError);
        // Continue despite error
      } else {
        console.log('[useMembershipUpdate] Successfully logged subscription activity');
      }

      return true;
    } catch (error) {
      console.error('[useMembershipUpdate] Error updating membership status:', error);
      return false;
    }
  };

  return { updateMembershipStatus };
};
