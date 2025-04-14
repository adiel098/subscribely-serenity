
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCommunityContext } from "@/contexts/CommunityContext";

export const useFetchSubscriptionPlans = (communityId: string) => {
  const { isGroupSelected } = useCommunityContext();
  
  return useQuery({
    queryKey: [isGroupSelected ? 'group-subscription-plans' : 'subscription-plans', communityId],
    queryFn: async () => {
      if (!communityId) return [];
      
      // First get the project_id for this community
      const { data: communityData, error: communityError } = await supabase
        .from("communities")
        .select("project_id")
        .eq("id", communityId)
        .single();
      
      if (communityError || !communityData?.project_id) {
        console.error('Error fetching community project_id:', communityError);
        throw communityError;
      }
      
      // Then fetch plans using project_id
      const { data, error } = await supabase
        .from('project_plans')
        .select('*')
        .eq('project_id', communityData.project_id)
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
