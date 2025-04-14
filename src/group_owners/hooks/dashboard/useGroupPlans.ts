
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useGroupPlans");

export const useGroupPlans = (groupId: string | null) => {
  return useQuery({
    queryKey: ["group-plans", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      logger.log("Fetching plans for group ID:", groupId);
      
      try {
        const { data: plans, error } = await supabase
          .from("project_plans")  // Changed from "subscription_plans" to "project_plans"
          .select("*")
          .eq("community_id", groupId);
        
        if (error) {
          logger.error("Error fetching group plans:", error);
          return [];
        }
        
        return plans || [];
      } catch (error) {
        logger.error("Exception in group plans fetch:", error);
        return [];
      }
    },
    enabled: !!groupId
  });
};
