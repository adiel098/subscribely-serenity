
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionPlan, CreateSubscriptionPlanParams } from '@/group_owners/hooks/types/subscription.types';

export const useCreateSubscriptionPlan = (onSuccess?: (data: SubscriptionPlan) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPlan: CreateSubscriptionPlanParams): Promise<SubscriptionPlan> => {
      const { data, error } = await supabase
        .from('project_plans')
        .insert(newPlan)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as SubscriptionPlan;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      if (onSuccess) {
        onSuccess(data);
      }
    }
  });
};
