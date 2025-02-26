
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreateSubscriptionPlanData } from "../types/subscription.types";

export const useCreateSubscriptionPlan = (communityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPlan: CreateSubscriptionPlanData) => {
      console.log('Attempting to create new plan with data:', newPlan);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('Authentication required');
      }
      
      // Check if community exists first
      const { data: communityCheck, error: communityError } = await supabase
        .from('communities')
        .select('id, owner_id')
        .eq('id', newPlan.community_id)
        .single();
        
      if (communityError) {
        console.error('Error checking community:', communityError);
        throw new Error('Failed to verify community access');
      }
      
      console.log('Community check result:', communityCheck);
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert({
          community_id: newPlan.community_id,
          name: newPlan.name,
          description: newPlan.description || null,
          price: newPlan.price,
          interval: newPlan.interval,
          features: newPlan.features || [],
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating plan:', error);
        throw error;
      }
      
      console.log('Successfully created plan:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans', communityId] });
      toast.success('Subscription plan created successfully ✨');
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast.error(`Error creating subscription plan: ${error.message}`);
    }
  });
};
