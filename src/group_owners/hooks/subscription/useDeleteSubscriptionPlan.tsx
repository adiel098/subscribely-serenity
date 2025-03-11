
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDeleteSubscriptionPlan = (entityId: string, isGroup = false) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', planId);
        
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      // Invalidate the query to refetch the updated list
      queryClient.invalidateQueries({ 
        queryKey: [isGroup ? 'group-subscription-plans' : 'subscription-plans', entityId] 
      });
    }
  });
};
