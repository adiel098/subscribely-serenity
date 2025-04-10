
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { 
  SubscriptionPlan, 
  CreateSubscriptionPlanParams,
  UpdatePlanParams,
  TogglePlanStatusParams
} from "./types/subscription.types";
import { createLogger } from "@/utils/debugUtils";

const logger = createLogger("useSubscriptionPlans");

export const useSubscriptionPlans = (projectId?: string) => {
  const queryClient = useQueryClient();
  
  // Query for fetching plans
  const query = useQuery({
    queryKey: ['subscription-plans', projectId],
    queryFn: async () => {
      if (!projectId) {
        logger.warn("No project ID provided to useSubscriptionPlans");
        return [];
      }
      
      logger.log(`Fetching subscription plans for projectId: ${projectId}`);
      
      const { data, error } = await supabase
        .from('project_plans')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
        
      if (error) {
        logger.error('Error fetching subscription plans:', error);
        throw error;
      }
      
      logger.log(`Fetched ${data?.length || 0} subscription plans`);
      return data as SubscriptionPlan[];
    },
    enabled: !!projectId
  });

  // Mutation for creating plans
  const createPlan = useMutation({
    mutationFn: async (planData: CreateSubscriptionPlanParams) => {
      logger.log("Creating subscription plan:", planData);
      
      const { data, error } = await supabase
        .from('project_plans')
        .insert(planData)
        .select()
        .single();
        
      if (error) {
        logger.error('Error creating subscription plan:', error);
        throw error;
      }
      
      return data as SubscriptionPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans', projectId] });
    }
  });

  // Mutation for updating plans
  const updatePlan = useMutation({
    mutationFn: async ({ id, updates }: UpdatePlanParams) => {
      logger.log(`Updating subscription plan ${id}:`, updates);
      
      const { data, error } = await supabase
        .from('project_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        logger.error('Error updating subscription plan:', error);
        throw error;
      }
      
      return data as SubscriptionPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans', projectId] });
    }
  });

  // Mutation for deleting plans
  const deletePlan = useMutation({
    mutationFn: async (planId: string) => {
      logger.log(`Deleting subscription plan: ${planId}`);
      
      const { error } = await supabase
        .from('project_plans')
        .delete()
        .eq('id', planId);
        
      if (error) {
        logger.error('Error deleting subscription plan:', error);
        throw error;
      }
      
      return planId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans', projectId] });
    }
  });

  // Mutation for toggling plan status
  const togglePlanStatus = useMutation({
    mutationFn: async ({ id, is_active }: TogglePlanStatusParams) => {
      logger.log(`Toggling plan status: ${id} to ${is_active}`);
      
      const { data, error } = await supabase
        .from('project_plans')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        logger.error('Error toggling subscription plan status:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans', projectId] });
    }
  });

  return {
    plans: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanStatus,
  };
};
