
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Community } from "./useCommunities";
import { toast } from "sonner";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";
import { useRef } from "react";

const logger = createLogger("useProjectCommunities");

export const useProjectCommunities = (projectId: string | null) => {
  const prevProjectIdRef = useRef<string | null>(null);
  const dataLoadedRef = useRef<boolean>(false);
  
  const query = useQuery({
    queryKey: ["project-communities", projectId],
    queryFn: async () => {
      if (!projectId) {
        return [];
      }
      
      // Prevent unnecessary logs for the same projectId
      if (prevProjectIdRef.current !== projectId) {
        logger.log("Fetching communities for project:", projectId);
        prevProjectIdRef.current = projectId;
        dataLoadedRef.current = false;
      }
      
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
        
        // Only log success once per projectId
        if (!dataLoadedRef.current) {
          logger.log("Successfully fetched project communities:", data || []);
          dataLoadedRef.current = true;
        }
        
        return (data || []) as Community[];
      } catch (error) {
        logger.error("Exception in project communities query:", error);
        return [];
      }
    },
    enabled: !!projectId,
    staleTime: 300000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when the window is focused
    refetchInterval: false, // Don't refetch automatically
    refetchOnMount: true // Only refetch on mount, not during re-renders
  });

  return {
    ...query,
    data: query.data || []
  };
};
