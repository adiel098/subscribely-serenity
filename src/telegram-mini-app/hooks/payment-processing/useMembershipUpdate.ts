
import { supabase } from "@/integrations/supabase/client";
import { createOrUpdateMember } from "@/telegram-mini-app/services/memberService";
import { formatTelegramId } from "@/telegram-mini-app/utils/telegram/idValidation";

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
      // Ensure the Telegram ID is properly formatted
      const formattedTelegramId = formatTelegramId(telegramUserId);
      
      if (!formattedTelegramId) {
        console.error('[useMembershipUpdate] Invalid Telegram ID format:', telegramUserId);
        return false;
      }
      
      console.log('[useMembershipUpdate] Using formatted Telegram ID:', formattedTelegramId);

      // Calculate subscription dates based on the plan details if provided
      let subscriptionStartDate = new Date();
      let subscriptionEndDate: Date | null = null;
      
      if (planDetails?.interval) {
        subscriptionEndDate = new Date(subscriptionStartDate);
        
        // Add duration based on interval - FIX for yearly subscriptions
        switch (planDetails.interval) {
          case "monthly":
            subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
            break;
          case "yearly":
            subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
            break;
          case "half-yearly":
            subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 6);
            break;
          case "quarterly":
            subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 3);
            break;
          case "weekly":
            subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 7);
            break;
          case "one_time":
          case "one-time":
            subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
            break;
          case "lifetime":
            subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 100);
            break;
          default:
            // Default to 30 days if interval not recognized
            subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);
            break;
        }
        
        console.log(`[useMembershipUpdate] Calculated subscription dates: Start=${subscriptionStartDate.toISOString()}, End=${subscriptionEndDate.toISOString()}`);
      } else {
        console.log('[useMembershipUpdate] No plan details provided, will retrieve from server');
      }

      // Immediately create/update member record with all subscription details
      const membershipResult = await createOrUpdateMember({
        telegram_id: formattedTelegramId,
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
          telegram_user_id: formattedTelegramId,
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
