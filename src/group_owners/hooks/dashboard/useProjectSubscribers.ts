
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useProjectSubscribers");

export const useProjectSubscribers = (projectId: string | null) => {
  return useQuery({
    queryKey: ["project-subscribers", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      logger.log("Fetching subscribers for project ID:", projectId);
      
      try {
        const { data: subscribers, error } = await supabase
          .from("project_subscribers")
          .select("*")
          .eq("project_id", projectId)
          .order("joined_at", { ascending: false });
        
        if (error) {
          logger.error("Error fetching project subscribers:", error);
          return [];
        }
        
        logger.log(`Fetched ${subscribers?.length || 0} project subscribers`);
        return subscribers || [];
      } catch (error) {
        logger.error("Exception in project subscribers fetch:", error);
        return [];
      }
    },
    enabled: !!projectId
  });
};
