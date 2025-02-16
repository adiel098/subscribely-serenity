
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
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('community_id', communityId)
        .order('price', { ascending: true });

      if (error) throw error;
      return data as SubscriptionPlan[];
    }
  });

  const createPlan = useMutation({
    mutationFn: async (newPlan: CreateSubscriptionPlanData) => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert(newPlan)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans', communityId] });
      toast.success('תוכנית המנוי נוצרה בהצלחה');
    },
    onError: (error) => {
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
      toast.success('תוכנית המנוי עודכנה בהצלחה');
    },
    onError: (error) => {
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
      toast.success('תוכנית המנוי נמחקה בהצלחה');
    },
    onError: (error) => {
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
