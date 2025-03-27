
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommunityContext } from "@/contexts/CommunityContext";

interface UpdatePlanParams {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
}

export const useUpdateSubscriptionPlan = (communityId: string) => {
  const queryClient = useQueryClient();
  const { isGroupSelected } = useCommunityContext();
  
  return useMutation({
    mutationFn: async (planData: UpdatePlanParams) => {
      // Log operation for debugging
      console.log(`Updating plan with ID: ${planData.id} for community: ${communityId}`);
      
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
        .select();
        
      if (error) {
        console.error("Error updating subscription plan:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.warn("No rows were returned after update, plan may not exist:", planData.id);
        throw new Error("Plan not found or could not be updated");
      }
      
      return data[0];
    },
    onSuccess: () => {
      // Invalidate the query to refetch the updated list
      queryClient.invalidateQueries({ 
        queryKey: [isGroupSelected ? 'group-subscription-plans' : 'subscription-plans', communityId] 
      });
    }
  });
};
