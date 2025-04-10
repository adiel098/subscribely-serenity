
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { createLogger } from "@/utils/debugUtils";

const logger = createLogger("useToggleSubscriptionPlanStatus");

interface TogglePlanStatusParams {
  id: string;
  is_active: boolean;
}

/**
 * Hook to toggle the active status of a subscription plan
 */
export const useToggleSubscriptionPlanStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: TogglePlanStatusParams) => {
      logger.log(`Toggling plan status: ${params.id} to ${params.is_active}`);
      
      const { data, error } = await supabase
        .from('project_plans')
        .update({ is_active: params.is_active })
        .eq('id', params.id)
        .select()
        .single();
        
      if (error) {
        logger.error('Error toggling subscription plan status:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries to refetch data
      logger.log(`Successfully toggled plan status for: ${data.id}`);
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
    },
    onError: (error) => {
      logger.error('Failed to toggle subscription plan status:', error);
    }
  });
};
