
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { toast } from "sonner";

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
      console.log("Plan data being sent:", JSON.stringify(planData, null, 2));
      
      try {
        // First verify if the plan exists
        const { data: existingPlan, error: checkError } = await supabase
          .from('subscription_plans')
          .select('id')
          .eq('id', planData.id)
          .maybeSingle();
          
        if (checkError) {
          console.error("Error checking if plan exists:", checkError);
          throw checkError;
        }
        
        if (!existingPlan) {
          console.error(`Plan with ID ${planData.id} not found in database`);
          throw new Error(`Plan with ID ${planData.id} not found`);
        }
        
        // If we get here, the plan exists, so update it
        const { data, error } = await supabase
          .from('subscription_plans')
          .update({
            name: planData.name,
            description: planData.description,
            price: planData.price,
            interval: planData.interval,
            features: planData.features,
            has_trial_period: planData.has_trial_period,
            trial_days: planData.trial_days
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
        
        console.log("Successfully updated plan:", data[0]);
        return data[0];
      } catch (error) {
        console.error("Exception in update subscription plan:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate the query to refetch the updated list
      queryClient.invalidateQueries({ 
        queryKey: [isGroupSelected ? 'group-subscription-plans' : 'subscription-plans', communityId] 
      });
      toast.success("Subscription plan updated successfully");
    },
    onError: (error: any) => {
      console.error("Error in mutation:", error);
      toast.error("Failed to update subscription plan", {
        description: error?.message || "An unexpected error occurred"
      });
    }
  });
};
