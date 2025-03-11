
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateSubscriptionPlanData } from "../types/subscription.types";

export const useCreateSubscriptionPlan = (entityId: string, isGroup = false) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (planData: Omit<CreateSubscriptionPlanData, 'community_id' | 'group_id'>) => {
      // Get the default community ID if we're creating a group plan
      let communityIdForGroup = null;
      
      if (isGroup) {
        // For groups, we need to find a valid community_id to satisfy the NOT NULL constraint
        const { data: groupData } = await supabase
          .from('community_groups')
          .select('id, owner_id')
          .eq('id', entityId)
          .single();
          
        if (groupData) {
          // Get the first community of the owner to use as the community_id
          const { data: ownedCommunities } = await supabase
            .from('communities')
            .select('id')
            .eq('owner_id', groupData.owner_id)
            .limit(1);
            
          if (ownedCommunities && ownedCommunities.length > 0) {
            communityIdForGroup = ownedCommunities[0].id;
          } else {
            // If no communities found, we can't create a plan due to the constraint
            throw new Error("No valid community found for this group. Please create a community first.");
          }
        }
      }
      
      // Construct the payload based on whether it's a group or community
      const payload = {
        community_id: isGroup ? communityIdForGroup : entityId,
        group_id: isGroup ? entityId : null,
        name: planData.name,
        description: planData.description || null,
        price: planData.price,
        interval: planData.interval,
        features: planData.features || [],
        is_active: true // Ensure plans are active by default
      };
      
      console.log("Creating subscription plan with payload:", payload);
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert(payload)
        .select()
        .single();
        
      if (error) {
        console.error("Error in subscription plan creation:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate the query to refetch the updated list
      queryClient.invalidateQueries({ 
        queryKey: [isGroup ? 'group-subscription-plans' : 'subscription-plans', entityId] 
      });
    }
  });
};
