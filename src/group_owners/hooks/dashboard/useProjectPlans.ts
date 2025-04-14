import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";
import { useRef } from "react";

const logger = createLogger("useProjectPlans");

export const useProjectPlans = (projectId: string | null) => {
  // Create ref outside of any try-catch or conditional blocks
  const prevProjectIdRef = useRef<string | null>(null);
  
  // Log outside to ensure it runs even in error cases
  logger.log("🔍 useProjectPlans called with projectId:", projectId);
  
  try {
    return useQuery({
      queryKey: ["project-plans", projectId],
      queryFn: async () => {
        try {
          if (!projectId) {
            logger.log("❌ useProjectPlans: No projectId provided, returning empty array");
            return [];
          }
          
          // Prevent unnecessary logs for the same projectId
          if (prevProjectIdRef.current !== projectId) {
            logger.log("📊 Fetching plans for project ID:", projectId);
            prevProjectIdRef.current = projectId;
          }
          
          // Fetch plans using project_id
          logger.log("🔄 Starting supabase query for project plans");
          const { data: plans, error } = await supabase
            .from("project_plans")
            .select("*")
            .eq("project_id", projectId)
            .order("price", { ascending: true });
          
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
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchInterval: false,
      initialData: []
    });
  } catch (error) {
    logger.error("🛑 Exception in useProjectPlans hook:", error);
    // Return a default query result with empty array
    return {
      data: [],
      isLoading: false,
      isError: true,
      error: error
    } as any;
  }
};
