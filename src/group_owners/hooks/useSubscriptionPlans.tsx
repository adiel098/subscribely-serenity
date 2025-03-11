
import { useFetchSubscriptionPlans } from "./subscription/useFetchSubscriptionPlans";
import { useCreateSubscriptionPlan } from "./subscription/useCreateSubscriptionPlan";
import { useUpdateSubscriptionPlan } from "./subscription/useUpdateSubscriptionPlan";
import { useDeleteSubscriptionPlan } from "./subscription/useDeleteSubscriptionPlan";
import { useCommunityContext } from "@/contexts/CommunityContext";

export const useSubscriptionPlans = (entityId: string) => {
  console.log('useSubscriptionPlans hook initialized with entityId:', entityId);
  
  // With our consolidated model, all plans belong to communities
  // (groups are just communities with is_group=true)
  const { 
    data: plans, 
    isLoading, 
    refetch 
  } = useFetchSubscriptionPlans(entityId);
  
  const createPlan = useCreateSubscriptionPlan(entityId);
  const updatePlan = useUpdateSubscriptionPlan(entityId);
  const deletePlan = useDeleteSubscriptionPlan(entityId);

  return {
    plans,
    isLoading,
    createPlan,
    updatePlan,
    deletePlan,
    refetch
  };
};
