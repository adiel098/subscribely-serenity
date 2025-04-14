
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
        // First get the project_id for this community/group
        const { data: communityData, error: communityError } = await supabase
          .from("communities")
          .select("project_id")
          .eq("id", groupId)
          .single();
        
        if (communityError || !communityData?.project_id) {
          logger.error("Error fetching community project_id:", communityError);
          return [];
        }
        
        // Then fetch plans using project_id
        const { data: plans, error } = await supabase
          .from("project_plans")
          .select("*")
          .eq("project_id", communityData.project_id);
        
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
