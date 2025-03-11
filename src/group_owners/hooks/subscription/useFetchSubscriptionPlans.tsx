
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useFetchSubscriptionPlans = (entityId: string, isGroup = false) => {
  return useQuery({
    queryKey: [isGroup ? 'group-subscription-plans' : 'subscription-plans', entityId],
    queryFn: async () => {
      if (!entityId) return [];
      
      // Choose column to filter on based on entity type
      const filterColumn = isGroup ? 'group_id' : 'community_id';
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq(filterColumn, entityId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching subscription plans:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!entityId
  });
};
