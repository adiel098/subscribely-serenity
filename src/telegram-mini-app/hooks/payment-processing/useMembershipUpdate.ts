
import { supabase } from "@/integrations/supabase/client";
import { createOrUpdateMember } from "@/telegram-mini-app/services/memberService";

interface MembershipUpdateParams {
  telegramUserId: string;
  communityId: string;
  planId: string;
  paymentId?: string;
  username?: string;
  planDetails?: {
    interval?: string;
    price?: number;
  };
}

export const useMembershipUpdate = () => {
  const updateMembershipStatus = async ({
    telegramUserId,
    communityId,
    planId,
    paymentId,
    username,
    planDetails
  }: MembershipUpdateParams): Promise<boolean> => {
    console.log('[useMembershipUpdate] Starting membership update with params:', {
      telegramUserId,
      communityId,
      planId,
      paymentId,
      username,
      planDetails
    });

    try {
      // Calculate subscription dates based on the plan details if provided
      let subscriptionStartDate = new Date();
      let subscriptionEndDate: Date | null = null;
      
      if (planDetails?.interval) {
        subscriptionEndDate = new Date(subscriptionStartDate);
        
        // Add duration based on interval
        if (planDetails.interval === "monthly") {
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        } else if (planDetails.interval === "yearly") {
          subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
        } else if (planDetails.interval === "half-yearly") {
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 6);
        } else if (planDetails.interval === "quarterly") {
          subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 3);
        } else if (planDetails.interval === "weekly") {
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 7);
        } else if (planDetails.interval === "one_time") {
          // Default 1-year validity for one-time payments
          subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
        } else {
          // Default to 30 days if interval not recognized
          subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
        }
        
        console.log(`[useMembershipUpdate] Calculated subscription dates: Start=${subscriptionStartDate.toISOString()}, End=${subscriptionEndDate.toISOString()}`);
      } else {
        console.log('[useMembershipUpdate] No plan details provided, will retrieve from server');
      }

      // Immediately create/update member record in telegram_chat_members with all subscription details
      const membershipResult = await createOrUpdateMember({
        telegram_id: telegramUserId,
        community_id: communityId,
        subscription_plan_id: planId,
        status: 'active',
        payment_id: paymentId,
        username,
        subscription_start_date: subscriptionStartDate.toISOString(),
        subscription_end_date: subscriptionEndDate?.toISOString()
      });

      if (!membershipResult) {
        console.error('[useMembershipUpdate] Failed to create/update member record');
        return false;
      }

      console.log('[useMembershipUpdate] Successfully created/updated member record with subscription details');
      
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
