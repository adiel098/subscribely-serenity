
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";
import { useRef } from "react";

const logger = createLogger("useProjectPlans");

export const useProjectPlans = (projectId: string | null) => {
  const prevProjectIdRef = useRef<string | null>(null);
  
  return useQuery({
    queryKey: ["project-plans", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      // Prevent unnecessary logs for the same projectId
      if (prevProjectIdRef.current !== projectId) {
        logger.log("Fetching plans for project ID:", projectId);
        prevProjectIdRef.current = projectId;
      }
      
      try {
        // Fetch plans using project_id
        const { data: plans, error } = await supabase
          .from("project_plans")
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
    enabled: !!projectId,
    staleTime: 60000, // Cache for 1 minute
    refetchOnWindowFocus: false, // Don't refetch when the window is focused
    refetchOnMount: true // Only refetch on mount
  });
};
