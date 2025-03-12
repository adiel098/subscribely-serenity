
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateSubscriptionPlanData } from "../types/subscription.types";
import { useCommunityContext } from "@/contexts/CommunityContext";

export const useCreateSubscriptionPlan = (communityId: string) => {
  const queryClient = useQueryClient();
  const { isGroupSelected } = useCommunityContext();
  
  return useMutation({
    mutationFn: async (planData: Omit<CreateSubscriptionPlanData, 'community_id'>) => {
      // With our consolidated model, all plans belong to communities
      const payload = {
        community_id: communityId,
        name: planData.name,
        description: planData.description || null,
        price: planData.price,
        interval: planData.interval,
        features: planData.features || [],
        is_active: true // Ensure plans are active by default
      };
      
      console.log("Creating subscription plan with payload:", payload);
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert(payload)
        .select()
        .single();
        
      if (error) {
        console.error("Error in subscription plan creation:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate the query to refetch the updated list
      queryClient.invalidateQueries({ 
        queryKey: [isGroupSelected ? 'group-subscription-plans' : 'subscription-plans', communityId] 
      });
    }
  });
};
