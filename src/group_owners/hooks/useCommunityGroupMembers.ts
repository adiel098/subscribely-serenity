
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useCommunityGroupMembers");

export const useCommunityGroupMembers = (projectId: string | null) => {
  const query = useQuery({
    queryKey: ["project-communities", projectId],
    queryFn: async () => {
      if (!projectId) {
        return [];
      }
      
      try {
        logger.log("Fetching communities for project ID:", projectId);
        
        // Fetch communities that belong to this project
        const { data, error } = await supabase
          .from("communities")
          .select("*")
          .eq("project_id", projectId);
          
        if (error) {
          logger.error("Error fetching project communities:", error);
          throw error;
        }
        
        logger.log(`Found ${data?.length || 0} communities in project ${projectId}`);
        return data || [];
      } catch (error) {
        logger.error("Error in project communities query:", error);
        return [];
      }
    },
    enabled: !!projectId
  });
  
  return query;
};
