
import { useFetchSubscriptionPlans } from "./subscription/useFetchSubscriptionPlans";
import { useCreateSubscriptionPlan } from "./subscription/useCreateSubscriptionPlan";
import { useUpdateSubscriptionPlan } from "./subscription/useUpdateSubscriptionPlan";
import { useDeleteSubscriptionPlan } from "./subscription/useDeleteSubscriptionPlan";
import { useCommunityContext } from "@/contexts/CommunityContext";

export const useSubscriptionPlans = (entityId: string) => {
  console.log('useSubscriptionPlans hook initialized with entityId:', entityId);
  
  const { isGroupSelected } = useCommunityContext();
  
  const { 
    data: plans, 
    isLoading, 
    refetch 
  } = useFetchSubscriptionPlans(entityId, isGroupSelected);
  
  const createPlan = useCreateSubscriptionPlan(entityId, isGroupSelected);
  const updatePlan = useUpdateSubscriptionPlan(entityId, isGroupSelected);
  const deletePlan = useDeleteSubscriptionPlan(entityId, isGroupSelected);

  return {
    plans,
    isLoading,
    createPlan,
    updatePlan,
    deletePlan,
    refetch
  };
};
