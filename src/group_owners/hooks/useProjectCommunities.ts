
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Community } from "./useCommunities";
import { toast } from "sonner";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useProjectCommunities");

export const useProjectCommunities = (projectId: string | null) => {
  const query = useQuery({
    queryKey: ["project-communities", projectId],
    queryFn: async () => {
      if (!projectId) {
        logger.log("No project ID provided, returning empty array");
        return [];
      }
      
      logger.log("Fetching communities for project:", projectId);
      
      try {
        const { data, error } = await supabase
          .from("communities")
          .select("*")
          .eq("project_id", projectId);
        
        if (error) {
          logger.error("Error fetching project communities:", error);
          toast.error("Failed to fetch project communities");
          throw error;
        }
        
        logger.log("Successfully fetched project communities:", data);
        return data as Community[];
      } catch (error) {
        logger.error("Exception in project communities query:", error);
        toast.error("An error occurred while fetching project communities");
        return [];
      }
    },
    enabled: !!projectId
  });

  return query;
};
