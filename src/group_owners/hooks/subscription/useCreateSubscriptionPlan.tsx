
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateSubscriptionPlanData } from "../types/subscription.types";

export const useCreateSubscriptionPlan = (entityId: string, isGroup = false) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (planData: Omit<CreateSubscriptionPlanData, 'community_id' | 'group_id'>) => {
      // Construct the payload based on whether it's a group or community
      // With our updated constraint, we only set one of community_id or group_id
      const payload = {
        community_id: isGroup ? null : entityId,
        group_id: isGroup ? entityId : null,
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
        queryKey: [isGroup ? 'group-subscription-plans' : 'subscription-plans', entityId] 
      });
    }
  });
};
