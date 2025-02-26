
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SubscriptionPlan } from "../types/subscription.types";

export const useUpdateSubscriptionPlan = (communityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<SubscriptionPlan> & { id: string }) => {
      console.log('Attempting to update plan:', id, 'with data:', updateData, 'for community:', communityId);
      
      if (!communityId) {
        console.error('No community ID provided');
        throw new Error('Community ID is required');
      }

      // First verify that the plan belongs to the specified community
      const { data: existingPlan, error: verifyError } = await supabase
        .from('subscription_plans')
        .select('community_id, name')
        .eq('id', id)
        .maybeSingle();

      if (verifyError) {
        console.error('Plan verification query failed:', verifyError);
        throw new Error('Failed to verify plan ownership');
      }

      if (!existingPlan) {
        console.error('Plan not found:', id);
        throw new Error('Subscription plan not found');
      }

      if (existingPlan.community_id !== communityId) {
        console.error('Plan belongs to different community:', existingPlan.community_id, 'expected:', communityId);
        throw new Error('Plan does not belong to this community');
      }

      console.log('Plan verification successful:', existingPlan.name);

      const { data, error } = await supabase
        .from('subscription_plans')
        .update(updateData)
        .eq('id', id)
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
    onError: (error: Error) => {
      console.error('Error updating subscription plan:', error);
      toast.error('Error updating subscription plan');
    }
  });
};
