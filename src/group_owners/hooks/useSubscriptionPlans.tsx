
import { useFetchSubscriptionPlans } from "./subscription/useFetchSubscriptionPlans";
import { useCreateSubscriptionPlan } from "./subscription/useCreateSubscriptionPlan";
import { useUpdateSubscriptionPlan } from "./subscription/useUpdateSubscriptionPlan";
import { useDeleteSubscriptionPlan } from "./subscription/useDeleteSubscriptionPlan";

export const useSubscriptionPlans = (communityId: string) => {
  console.log('useSubscriptionPlans hook initialized with communityId:', communityId);
  
  const { 
    data: plans, 
    isLoading, 
    refetch 
  } = useFetchSubscriptionPlans(communityId);
  
  const createPlan = useCreateSubscriptionPlan(communityId);
  const updatePlan = useUpdateSubscriptionPlan(communityId);
  const deletePlan = useDeleteSubscriptionPlan(communityId);

  return {
    plans,
    isLoading,
    createPlan,
    updatePlan,
    deletePlan,
    refetch
  };
};
