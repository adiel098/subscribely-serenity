
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useProjectPlans");

export const useProjectPlans = (projectId: string | null) => {
  return useQuery({
    queryKey: ["project-plans", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      logger.log("Fetching plans for project ID:", projectId);
      
      try {
        const { data: plans, error } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("project_id", projectId);
        
        if (error) {
          logger.error("Error fetching project plans:", error);
          return [];
        }
        
        return plans || [];
      } catch (error) {
        logger.error("Exception in project plans fetch:", error);
        return [];
      }
    },
    enabled: !!projectId
  });
};
