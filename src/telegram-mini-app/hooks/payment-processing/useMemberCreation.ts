
import { useState } from "react";
import { createOrUpdateMember } from "../../services/memberService";
import { calculateSubscriptionDates } from "./utils/subscription-dates.utils";
import { toast } from "sonner";

interface MemberCreationParams {
  telegramUserId?: string;
  communityId: string;
  planId: string;
  planInterval?: string;
  paymentId?: string;
  telegramUsername?: string;
  hasTrial?: boolean;
  trialDays?: number;
}

export const useMemberCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const createMember = async ({
    telegramUserId,
    communityId,
    planId,
    planInterval,
    paymentId,
    telegramUsername,
    hasTrial = false,
    trialDays = 0
  }: MemberCreationParams) => {
    if (!telegramUserId) return false;
    
    setIsCreating(true);
    setError(null);
    
    try {
      console.log(`[useMemberCreation] Creating member record with subscription dates`);
      console.log(`[useMemberCreation] Trial: ${hasTrial ? 'Yes' : 'No'}, Days: ${trialDays}`);
      
      // Calculate start and end dates for subscription or trial
      const { startDate, endDate } = calculateSubscriptionDates(
        planInterval, 
        hasTrial, 
        trialDays
      );
      
      console.log(`[useMemberCreation] Start date: ${startDate.toISOString()}`);
      console.log(`[useMemberCreation] End date: ${endDate.toISOString()}`);
      
      // Create or update the member record
      const memberResult = await createOrUpdateMember({
        telegram_id: telegramUserId,
        community_id: communityId,
        subscription_plan_id: planId,
        status: 'active',
        payment_id: paymentId,
        username: telegramUsername,
        subscription_start_date: startDate.toISOString(),
        subscription_end_date: endDate.toISOString(),
        is_trial: hasTrial && trialDays > 0
      });
      
      if (!memberResult) {
        console.error("[useMemberCreation] Failed to create/update member record");
        toast.error("Payment processed but membership record creation failed");
        return false;
      }
      
      console.log("[useMemberCreation] Member record created/updated successfully");
      return true;
    } catch (err) {
      console.error("[useMemberCreation] Error creating member:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to create member record";
      setError(errorMessage);
      return false;
    } finally {
      setIsCreating(false);
    }
  };
  
  return {
    createMember,
    isCreating,
    error
  };
};
