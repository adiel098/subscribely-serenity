import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommunityContext } from "@/contexts/CommunityContext";

export const useDeleteSubscriptionPlan = (communityId: string) => {
  const queryClient = useQueryClient();
  const { isGroupSelected } = useCommunityContext();
  
  return useMutation({
    mutationFn: async (planId: string) => {
      try {
        const { error } = await supabase
          .from('project_plans')
          .delete()
          .eq('id', planId);

        if (error) {
          throw error;
        }

        return true;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate the query to refetch the updated list
      queryClient.invalidateQueries({ 
        queryKey: [isGroupSelected ? 'group-subscription-plans' : 'subscription-plans', communityId] 
      });
    }
  });
};
