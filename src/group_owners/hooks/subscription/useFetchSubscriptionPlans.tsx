
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommunityContext } from "@/contexts/CommunityContext";

export const useFetchSubscriptionPlans = (communityId: string) => {
  const { isGroupSelected } = useCommunityContext();
  
  return useQuery({
    queryKey: [isGroupSelected ? 'group-subscription-plans' : 'subscription-plans', communityId],
    queryFn: async () => {
      if (!communityId) return [];
      
      // With our consolidated model, all plans belong to communities
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching subscription plans:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!communityId
  });
};
