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
  // Create refs outside of try/catch blocks
  const prevProjectIdRef = useRef<string | null>(null);
  const subscribersRef = useRef<any[]>([]);

  try {
    logger.log("🔍 useProjectSubscribers called with projectId:", projectId);
    
    return useQuery({
      queryKey: ["project-subscribers", projectId],
      queryFn: async () => {
        try {
          if (!projectId) {
            logger.log("❌ useProjectSubscribers: No projectId provided, returning empty array");
            return [];
          }
          
          // Prevent unnecessary logs for the same projectId
          if (prevProjectIdRef.current !== projectId) {
            logger.log("👥 Fetching subscribers for project ID:", projectId);
            prevProjectIdRef.current = projectId;
          }
          
          logger.log("🔄 Starting supabase query for project subscribers");
          const { data: subscribers, error } = await supabase
            .from("project_subscribers")
            .select("*")
            .eq("project_id", projectId)
            .order("joined_at", { ascending: false });
          
          if (error) {
            logger.error("❌ Error fetching project subscribers:", error);
            return [];
          }
          
          if (!subscribers) {
            logger.log("⚠️ No subscribers data returned from supabase");
            return [];
          }
          
          if (!Array.isArray(subscribers)) {
            logger.error("❓ Subscribers data is not an array:", typeof subscribers);
            return [];
          }
          
          logger.log("✅ Successfully fetched", subscribers.length, "project subscribers");
          return subscribers;
        } catch (error) {
          logger.error("🛑 Exception in project subscribers fetch:", error);
          return [];
        }
      },
      enabled: !!projectId,
      staleTime: 300000, // Cache for 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchInterval: false,
      initialData: [] // Always have an empty array as initial data to prevent undefined
    });
  } catch (error) {
    logger.error("🛑 Exception in useProjectSubscribers:", error);
  }
};
