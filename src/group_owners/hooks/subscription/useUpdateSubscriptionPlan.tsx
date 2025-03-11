
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UpdatePlanParams {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
}

export const useUpdateSubscriptionPlan = (entityId: string, isGroup = false) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (planData: UpdatePlanParams) => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .update({
          name: planData.name,
          description: planData.description,
          price: planData.price,
          interval: planData.interval,
          features: planData.features
        })
        .eq('id', planData.id)
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
