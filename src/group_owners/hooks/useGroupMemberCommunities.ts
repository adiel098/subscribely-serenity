
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Community } from "./useCommunities";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useGroupMemberCommunities");

export const useGroupMemberCommunities = (projectId: string | null) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["project-communities", projectId],
    queryFn: async (): Promise<Community[]> => {
      if (!projectId) {
        logger.log("No project ID provided, returning empty array");
        return [];
      }
      
      try {
        logger.log("Fetching member communities for project ID:", projectId);
        
        // Fetch communities that belong to this project directly
        const { data: communities, error } = await supabase
          .from("communities")
          .select(`
            *,
            member_count,
            subscription_count
          `)
          .eq("project_id", projectId);
        
        if (error) {
          logger.error("Error fetching project communities:", error);
          throw error;
        }
        
        logger.log(`Retrieved ${communities?.length || 0} communities from project ${projectId}`);
        
        return communities || [];
      } catch (error) {
        logger.error("Error in useGroupMemberCommunities:", error);
        return []; // Return empty array instead of throwing to prevent infinite loops
      }
    },
    enabled: !!projectId,
    refetchOnWindowFocus: false, // Prevent unexpected refetches
    staleTime: 30000, // Data stays fresh for 30 seconds
    retry: 1, // Only retry once to avoid excessive retries
  });
  
  // Extract just the community IDs for convenience
  const communityIds = data ? data.map(community => community.id) : [];
  
  return {
    communities: data || [],
    isLoading,
    error,
    communityIds
  };
};
