
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { SubscriptionPlan, CreatePlanParams, UpdatePlanParams, TogglePlanStatusParams } from './types/subscription.types';
import { toast } from "sonner";

export const useSubscriptionPlans = (projectId?: string) => {
  const queryClient = useQueryClient();
  
  // Fetch subscription plans
  const query = useQuery<SubscriptionPlan[], Error>({
    queryKey: ['subscription-plans', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
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
  
  // Create a new subscription plan
  const createPlan = useMutation({
    mutationFn: async (planData: CreatePlanParams) => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert([planData])
        .select()
        .single();
        
      if (error) throw error;
      return data as SubscriptionPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans', projectId] });
      toast.success("Subscription plan created successfully");
    },
    onError: (error) => {
      console.error("Error creating plan:", error);
      toast.error("Failed to create subscription plan");
    }
  });
  
  // Update an existing subscription plan
  const updatePlan = useMutation({
    mutationFn: async (params: UpdatePlanParams) => {
      const { id, updates, ...updateData } = params;
      const dataToUpdate = updates || updateData;
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data as SubscriptionPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans', projectId] });
      toast.success("Subscription plan updated successfully");
    },
    onError: (error) => {
      console.error("Error updating plan:", error);
      toast.error("Failed to update subscription plan");
    }
  });
  
  // Delete a subscription plan
  const deletePlan = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', planId);
        
      if (error) throw error;
      return planId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans', projectId] });
      toast.success("Subscription plan deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting plan:", error);
      toast.error("Failed to delete subscription plan");
    }
  });
  
  // Toggle a subscription plan's active status
  const togglePlanStatus = useMutation({
    mutationFn: async (params: TogglePlanStatusParams) => {
      const { id, is_active } = params;
      
      const { data, error } = await supabase
        .from('subscription_plans')
        .update({ is_active: !is_active })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data as SubscriptionPlan;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans', projectId] });
      toast.success(`Plan ${data.is_active ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error) => {
      console.error("Error toggling plan status:", error);
      toast.error("Failed to update plan status");
    }
  });

  return {
    plans: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanStatus
  };
};
