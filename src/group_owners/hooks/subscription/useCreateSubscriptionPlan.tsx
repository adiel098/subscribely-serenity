
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CreatePlanParams {
  community_id?: string;
  group_id?: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
}

export const useCreateSubscriptionPlan = (entityId: string, isGroup = false) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (planData: CreatePlanParams) => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert({
          ...(isGroup 
            ? { group_id: entityId } 
            : { community_id: entityId }),
          name: planData.name,
          description: planData.description,
          price: planData.price,
          interval: planData.interval,
          features: planData.features
        })
        .select()
        .single();
        
      if (error) throw error;
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
