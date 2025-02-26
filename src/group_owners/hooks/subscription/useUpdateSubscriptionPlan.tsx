
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SubscriptionPlan } from "../types/subscription.types";

export const useUpdateSubscriptionPlan = (communityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<SubscriptionPlan> & { id: string }) => {
      console.log('Attempting to update plan:', id, 'with data:', updateData);
      
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
    onError: (error: any) => {
      console.error('Error updating subscription plan:', error);
      toast.error('Error updating subscription plan');
    }
  });
};
