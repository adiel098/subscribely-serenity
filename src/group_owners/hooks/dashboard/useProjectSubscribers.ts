
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";
import { useRef } from "react";

const logger = createLogger("useProjectSubscribers");

export const useProjectSubscribers = (projectId: string | null) => {
  const prevProjectIdRef = useRef<string | null>(null);
  
  return useQuery({
    queryKey: ["project-subscribers", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      
      // Prevent unnecessary logs for the same projectId
      if (prevProjectIdRef.current !== projectId) {
        logger.log("Fetching subscribers for project ID:", projectId);
        prevProjectIdRef.current = projectId;
      }
      
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
    enabled: !!projectId,
    staleTime: 300000, // Cache for 5 minutes to prevent excessive refetching
    refetchOnWindowFocus: false, // Don't refetch when the window is focused
    refetchOnMount: true, // Only refetch on mount, not during re-renders
    refetchInterval: false // Don't automatically refetch at intervals
  });
};
