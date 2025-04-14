import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProjectContext } from "@/contexts/ProjectContext";

export const useDeleteSubscriptionPlan = () => {
  const { selectedProjectId } = useProjectContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from("subscription_plans")
        .delete()
        .eq("id", planId);

      if (error) {
        console.error("Error deleting subscription plan:", error);
        throw error;
      }

      return { success: true };
    },
    onSuccess: () => {
      const queryKey = ["subscription-plans", selectedProjectId];
      queryClient.invalidateQueries({ queryKey });
    }
  });
};
