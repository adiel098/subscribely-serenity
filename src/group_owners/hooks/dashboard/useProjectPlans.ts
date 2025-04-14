import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";
import { useRef } from "react";

const logger = createLogger("useProjectPlans");

export const useProjectPlans = (projectId: string | null) => {
  const prevProjectIdRef = useRef<string | null>(null);
  
  logger.log("🔍 useProjectPlans called with projectId:", projectId);
  
  return useQuery({
    queryKey: ["project-plans", projectId],
    queryFn: async () => {
      if (!projectId) {
        logger.log("❌ useProjectPlans: No projectId provided, returning empty array");
        return [];
      }
      
      // Prevent unnecessary logs for the same projectId
      if (prevProjectIdRef.current !== projectId) {
        logger.log("📊 Fetching plans for project ID:", projectId);
        prevProjectIdRef.current = projectId;
      }
      
      try {
        // Fetch plans using project_id
        logger.log("🔄 Starting supabase query for project plans");
        const { data: plans, error } = await supabase
          .from("project_plans")
          .select("*")
          .eq("project_id", projectId);
        
        if (error) {
          logger.error("❌ Error fetching project plans:", error);
          return [];
        }
        
        if (!plans) {
          logger.log("⚠️ No plans data returned from supabase");
          return [];
        }
        
        if (!Array.isArray(plans)) {
          logger.error("❓ Plans data is not an array:", typeof plans);
          return [];
        }
        
        logger.log("✅ Successfully fetched", plans.length, "project plans");
        return plans;
      } catch (error) {
        logger.error("🛑 Exception in project plans fetch:", error);
        return [];
      }
    },
    enabled: !!projectId,
    staleTime: 300000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when the window is focused
    refetchOnMount: true, // Only refetch on mount
    refetchInterval: false // Don't automatically refetch at intervals
  });
};
