
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriptionPlan {
  id: string;
  community_id: string;
  name: string;
  description: string | null;
  price: number;
  interval: 'monthly' | 'yearly';
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
  interval: 'monthly' | 'yearly';
  features?: string[];
}

export const useSubscriptionPlans = (communityId: string) => {
  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscription-plans', communityId],
    queryFn: async () => {
      if (!communityId) return [];
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('community_id', communityId)
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
        return [];
      }
      return data as SubscriptionPlan[];
    },
    enabled: Boolean(communityId),
  });

  const createPlan = useMutation({
    mutationFn: async (newPlan: CreateSubscriptionPlanData) => {
      console.log('Creating new plan:', newPlan); // Debug log
      
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
        console.error('Supabase error:', error); // Debug log
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans', communityId] });
      toast.success('תוכנית המנוי נוצרה בהצלחה ✨');
    },
    onError: (error: any) => {
      console.error('Error creating subscription plan:', error);
      toast.error('שגיאה ביצירת תוכנית המנוי');
    }
  });

  const updatePlan = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<SubscriptionPlan> & { id: string }) => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
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
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
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
