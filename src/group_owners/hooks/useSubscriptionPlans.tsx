
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriptionPlan {
  id: string;
  community_id: string;
  name: string;
  description: string | null;
  price: number;
  interval: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'one-time';
  is_active: boolean;
  features: string[];
  created_at: string;
  updated_at: string;
}

interface CreateSubscriptionPlanData {
  community_id: string;
  name: string;
  description?: string;
  price: number;
  interval: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'one-time';
  features?: string[];
}

export const useSubscriptionPlans = (communityId: string) => {
  console.log('useSubscriptionPlans hook initialized with communityId:', communityId);
  
  const queryClient = useQueryClient();

  const { data: plans, isLoading, refetch } = useQuery({
    queryKey: ['subscription-plans', communityId],
    queryFn: async () => {
      console.log('Fetching plans for community:', communityId);
      
      if (!communityId) {
        console.log('No communityId provided, returning empty array');
        return [];
      }

      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        console.error('No access token found');
        return [];
      }
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('community_id', communityId)
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return [];
      }
      
      console.log('Successfully fetched plans:', data);
      return data as SubscriptionPlan[];
    },
    enabled: Boolean(communityId),
  });

  const createPlan = useMutation({
    mutationFn: async (newPlan: CreateSubscriptionPlanData) => {
      console.log('Attempting to create new plan with data:', newPlan);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No access token found');
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
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
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
      console.error('Full error object:', JSON.stringify(error, null, 2));
      toast.error(`Error creating subscription plan: ${error.message}`);
    }
  });

  const updatePlan = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<SubscriptionPlan> & { id: string }) => {
      console.log('Attempting to update plan:', id, 'with data:', updateData);
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating plan:', error);
        throw error;
      }
      
      console.log('Successfully updated plan:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans', communityId] });
      toast.success('Subscription plan updated successfully ✨');
    },
    onError: (error: any) => {
      console.error('Error updating subscription plan:', error);
      toast.error('Error updating subscription plan');
    }
  });

  const deletePlan = useMutation({
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

  return {
    plans,
    isLoading,
    createPlan,
    updatePlan,
    deletePlan,
    refetch
  };
};
