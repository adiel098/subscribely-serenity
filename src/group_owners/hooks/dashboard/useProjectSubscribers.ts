import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";
import { useRef } from "react";

const logger = createLogger("useProjectSubscribers");

/**
 * Hook to fetch subscribers for a specific project
 * @param projectId - The ID of the project to fetch subscribers for
 * @returns Query result containing an array of subscribers (empty array if none found)
 */
export const useProjectSubscribers = (projectId: string | null) => {
  const prevProjectIdRef = useRef<string | null>(null);
  
  return useQuery({
    queryKey: ["project-subscribers", projectId],
    queryFn: async () => {
      if (!projectId) {
        logger.log("No project ID provided, returning empty array");
        return [];
      }
      
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
        
        // Verify that the subscribers array is valid
        if (!subscribers) {
          logger.log("No subscribers data returned, using empty array");
          return [];
        }
        
        // Make sure we're dealing with an array
        const safeSubscribers = Array.isArray(subscribers) ? subscribers : [];
        logger.log(`Fetched ${safeSubscribers.length} project subscribers`);
        return safeSubscribers;
      } catch (error) {
        logger.error("Exception in project subscribers fetch:", error);
        // Always return a valid array in case of error
        return [];
      }
    },
    enabled: !!projectId,
    staleTime: 300000, // Cache for 5 minutes to prevent excessive refetching
    refetchOnWindowFocus: false, // Don't refetch when the window is focused
    refetchOnMount: true, // Only refetch on mount, not during re-renders
    refetchInterval: false, // Don't automatically refetch at intervals
    // Default data ensures we always have a valid array
    initialData: []
  });
};
