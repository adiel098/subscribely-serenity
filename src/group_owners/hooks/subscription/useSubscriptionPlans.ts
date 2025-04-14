
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { createLogger } from "@/utils/debugUtils";

const logger = createLogger("useSubscriptionPlans");

/**
 * Hook to fetch subscription plans for a specific project
 */
export const useSubscriptionPlans = (projectId?: string) => {
  return useQuery({
    queryKey: ['subscription-plans', projectId],
    queryFn: async () => {
      if (!projectId) {
        logger.warn("No project ID provided to useSubscriptionPlans");
        return [];
      }
      
      logger.log(`Fetching subscription plans for projectId: ${projectId}`);
      
      const { data, error } = await supabase
        .from('project_plans')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
        
      if (error) {
        logger.error('Error fetching subscription plans:', error);
        throw error;
      }
      
      logger.log(`Fetched ${data?.length || 0} subscription plans`);
      return data || [];
    },
    enabled: !!projectId,
    staleTime: 60000 // Cache for 1 minute
  });
};
