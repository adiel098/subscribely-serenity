
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useSubscriptionPlans } from "./useSubscriptionPlans";
import { usePaymentMethods } from "./usePaymentMethods";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useCommunityRequirements");

export const useCommunityRequirements = (communityId: string | null) => {
  const { selectedProjectId } = useCommunityContext();

  // If a project is selected, we don't need to check community requirements
  const enabled = !selectedProjectId && !!communityId;
  
  // Get subscription plans and payment methods for this community
  const { plans } = useSubscriptionPlans(communityId || "");
  const { data: paymentMethods } = usePaymentMethods(communityId);
  
  const hasActivePlan = (plans && plans.length > 0 && plans.some(plan => plan.is_active)) || false;
  const hasActivePaymentMethod = (paymentMethods && paymentMethods.length > 0 && paymentMethods.some(pm => pm.is_active)) || false;
  
  logger.log(`Community ${communityId} requirements: hasActivePlan=${hasActivePlan}, hasActivePaymentMethod=${hasActivePaymentMethod}`);
  
  return {
    hasActivePlan,
    hasActivePaymentMethod
  };
};
