
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
        // Changed to join via communities to get plans
        const { data: communities, error: communitiesError } = await supabase
          .from("communities")
          .select("id")
          .eq("project_id", projectId);
        
        if (communitiesError) {
          logger.error("Error fetching project communities:", communitiesError);
          return [];
        }
        
        if (!communities || communities.length === 0) {
          return [];
        }
        
        // Get all plans for the communities in this project
        const communityIds = communities.map(c => c.id);
        const { data: plans, error } = await supabase
          .from("subscription_plans")
          .select("*")
          .in("community_id", communityIds);
        
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
