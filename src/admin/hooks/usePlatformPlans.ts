
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { 
  PlatformPlan, 
  CreatePlatformPlanData, 
  UpdatePlatformPlanData 
} from "./types/platformPlans.types";

export const usePlatformPlans = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const fetchPlans = async (): Promise<PlatformPlan[]> => {
    const { data, error } = await supabase
      .from("platform_plans")
      .select("*")
      .order("price");

    if (error) {
      throw error;
    }

    return data as PlatformPlan[];
  };

  const createPlan = useMutation({
    mutationFn: async (planData: CreatePlatformPlanData): Promise<PlatformPlan> => {
      const { data, error } = await supabase
        .from("platform_plans")
        .insert(planData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as PlatformPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platformPlans"] });
      toast({
        title: "Success",
        description: "Platform plan created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating platform plan:", error);
      toast({
        title: "Error",
        description: "Failed to create platform plan",
        variant: "destructive",
      });
    },
  });

  const updatePlan = useMutation({
    mutationFn: async (planData: UpdatePlatformPlanData): Promise<PlatformPlan> => {
      const { id, ...updateData } = planData;
      
      const { data, error } = await supabase
        .from("platform_plans")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as PlatformPlan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platformPlans"] });
      toast({
        title: "Success",
        description: "Platform plan updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating platform plan:", error);
      toast({
        title: "Error",
        description: "Failed to update platform plan",
        variant: "destructive",
      });
    },
  });

  const deletePlan = useMutation({
    mutationFn: async (planId: string): Promise<void> => {
      const { error } = await supabase
        .from("platform_plans")
        .delete()
        .eq("id", planId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platformPlans"] });
      toast({
        title: "Success",
        description: "Platform plan deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Error deleting platform plan:", error);
      toast({
        title: "Error",
        description: "Failed to delete platform plan",
        variant: "destructive",
      });
    },
  });

  const plansQuery = useQuery({
    queryKey: ["platformPlans"],
    queryFn: fetchPlans,
  });

  return {
    plans: plansQuery.data || [],
    isLoading: plansQuery.isLoading,
    isError: plansQuery.isError,
    error: plansQuery.error,
    createPlan,
    updatePlan,
    deletePlan,
    refetch: plansQuery.refetch,
  };
};
