import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionPlan } from './types/subscription.types';

export const useSubscriptionPlans = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ['subscription-plans', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');

      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as SubscriptionPlan[];
    },
    enabled: !!projectId
  });
};

// Function to create a new subscription plan
export const useCreateSubscriptionPlan = (options?: any) => {
  const createPlan = async (planData: any) => {
    if (!planData.project_id) throw new Error('Project ID is required');

    const { data, error } = await supabase
      .from('subscription_plans')
      .insert([planData])
      .select();

    if (error) throw error;
    return data[0];
  };

  return { 
    mutateAsync: createPlan,
    // Add other properties/methods as needed
  };
};

// Function to update a subscription plan
export const useUpdateSubscriptionPlan = (options?: any) => {
  const updatePlan = async ({ id, updates }: { id: string, updates: Partial<SubscriptionPlan> }) => {
    if (!id) throw new Error('Plan ID is required');

    const { data, error } = await supabase
      .from('subscription_plans')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  };

  return { 
    mutateAsync: updatePlan,
    // Add other properties/methods as needed
  };
};

// Function to delete a subscription plan
export const useDeleteSubscriptionPlan = (options?: any) => {
  const deletePlan = async (planId: string) => {
    if (!planId) throw new Error('Plan ID is required');

    const { error } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', planId);

    if (error) throw error;
    return true;
  };

  return { 
    mutateAsync: deletePlan,
    // Add other properties/methods as needed
  };
};

// Function to toggle a subscription plan's status
export const useToggleSubscriptionPlanStatus = (options?: any) => {
  const toggleStatus = async ({ id, is_active }: { id: string, is_active: boolean }) => {
    if (!id) throw new Error('Plan ID is required');

    const { data, error } = await supabase
      .from('subscription_plans')
      .update({ is_active })
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  };

  return { 
    mutateAsync: toggleStatus,
    // Add other properties/methods as needed
  };
};
