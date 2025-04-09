
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useProjectMiniAppUsers");

export const useProjectMiniAppUsers = (projectId: string | null, subscribers: any[] = []) => {
  return useQuery({
    queryKey: ["project-mini-app-users", projectId],
    queryFn: async () => {
      if (!projectId) return { count: 0, nonSubscribers: 0 };
      
      try {
        // Get communities in this project
        const { data: communities, error: communitiesError } = await supabase
          .from("communities")
          .select("id")
          .eq("project_id", projectId);
          
        if (communitiesError) {
          logger.error("Error fetching project communities:", communitiesError);
          return { count: 0, nonSubscribers: 0 };
        }
        
        if (!communities || communities.length === 0) {
          logger.log("No communities found for this project");
          return { count: 0, nonSubscribers: 0 };
        }
        
        const communityIds = communities.map(c => c.id);
        
        // Get mini app users for these communities
        const { data, error } = await supabase
          .from("telegram_mini_app_users")
          .select("telegram_id")
          .in("community_id", communityIds);
        
        if (error) {
          logger.error("Error fetching mini app users:", error);
          return { count: 0, nonSubscribers: 0 };
        }
        
        // Count total users and non-subscribers
        const totalCount = data?.length || 0;
        
        // Get subscriber telegram IDs
        const subscriberTelegramIds = subscribers.map(s => s.telegram_user_id);
        
        // Count non-subscribers
        const nonSubscribersCount = data?.filter(
          user => !subscriberTelegramIds.includes(user.telegram_id)
        ).length || 0;
        
        return {
          count: totalCount,
          nonSubscribers: nonSubscribersCount
        };
      } catch (error) {
        logger.error("Exception in project mini app users fetch:", error);
        return { count: 0, nonSubscribers: 0 };
      }
    },
    enabled: !!projectId
  });
};
