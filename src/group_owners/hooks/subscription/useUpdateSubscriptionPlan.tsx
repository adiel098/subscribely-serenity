
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SubscriptionPlan } from "../types/subscription.types";

export const useUpdateSubscriptionPlan = (communityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<SubscriptionPlan> & { id: string }) => {
      console.log('Attempting to update plan:', id, 'with data:', updateData, 'for community:', communityId);
      
      // First verify that the plan belongs to the specified community
      const { data: existingPlan, error: verifyError } = await supabase
        .from('subscription_plans')
        .select('community_id')
        .eq('id', id)
        .eq('community_id', communityId)
        .single();

      if (verifyError || !existingPlan) {
        console.error('Plan verification failed:', verifyError);
        throw new Error('Plan not found or does not belong to this community');
      }

      const { data, error } = await supabase
        .from('subscription_plans')
        .update(updateData)
        .eq('id', id)
        .eq('community_id', communityId) // Add community_id check
        .select()
        .single();

      if (error) {
        console.error('Error updating plan:', error);
        throw error;
      }
      
      console.log('Successfully updated plan:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans', communityId] });
      toast.success('Subscription plan updated successfully ✨');
    },
    onError: (error: any) => {
      console.error('Error updating subscription plan:', error);
      toast.error('Error updating subscription plan');
    }
  });
};
