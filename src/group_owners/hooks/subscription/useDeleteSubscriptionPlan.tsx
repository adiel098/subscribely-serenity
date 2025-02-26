
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteSubscriptionPlan = (communityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      console.log('Attempting to delete plan:', planId);
      
      // First, check if plan has any associated payments
      const { count, error: checkError } = await supabase
        .from('subscription_payments')
        .select('*', { count: 'exact', head: true })
        .eq('plan_id', planId);
        
      if (checkError) {
        console.error('Error checking plan usage:', checkError);
        throw new Error('Failed to check plan usage');
      }
      
      if (count && count > 0) {
        // Instead of deleting, we'll set is_active to false
        const { error } = await supabase
          .from('subscription_plans')
          .update({ is_active: false })
          .eq('id', planId);

        if (error) {
          console.error('Error deactivating plan:', error);
          throw error;
        }
      } else {
        // If no payments exist, we can safely delete the plan
        const { error } = await supabase
          .from('subscription_plans')
          .delete()
          .eq('id', planId);

        if (error) {
          console.error('Error deleting plan:', error);
          throw error;
        }
      }
      
      console.log('Successfully handled plan deletion/deactivation:', planId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans', communityId] });
      toast.success('Subscription plan removed successfully 🗑️');
    },
    onError: (error: any) => {
      console.error('Error deleting subscription plan:', error);
      toast.error('Error removing subscription plan');
    }
  });
};
