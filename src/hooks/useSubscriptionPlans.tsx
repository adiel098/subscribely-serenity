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

  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscription-plans', communityId],
    queryFn: async () => {
      console.log('Fetching plans for community:', communityId);
      
      if (!communityId) {
        console.log('No communityId provided, returning empty array');
        return [];
      }
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('community_id', communityId)
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
      console.log('Current auth session:', await supabase.auth.getSession());
      
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
    onSuccess: (data) => {
      console.log('Mutation succeeded, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['subscription-plans', communityId] });
      toast.success('תוכנית המנוי נוצרה בהצלחה ✨');
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      toast.error(`שגיאה ביצירת תוכנית המנוי: ${error.message}`);
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
      toast.success('תוכנית המנוי עודכנה בהצלחה ✨');
    },
    onError: (error: any) => {
      console.error('Error updating subscription plan:', error);
      toast.error('שגיאה בעדכון תוכנית המנוי');
    }
  });

  const deletePlan = useMutation({
    mutationFn: async (id: string) => {
      console.log('Attempting to delete plan:', id);
      
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting plan:', error);
        throw error;
      }
      
      console.log('Successfully deleted plan:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans', communityId] });
      toast.success('תוכנית המנוי נמחקה בהצלחה 🗑️');
    },
    onError: (error: any) => {
      console.error('Error deleting subscription plan:', error);
      toast.error('שגיאה במחיקת תוכנית המנוי');
    }
  });

  return {
    plans,
    isLoading,
    createPlan,
    updatePlan,
    deletePlan
  };
};
