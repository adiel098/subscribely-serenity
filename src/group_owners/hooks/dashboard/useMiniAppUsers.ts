
import { useQuery } from "@tanstack/react-query";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";
import { supabase } from "@/integrations/supabase/client";

const logger = createLogger("useMiniAppUsers");

export const useMiniAppUsers = (communityId: string | null, activeUserIds: string[]) => {
  return useQuery({
    queryKey: ["mini-app-users", communityId],
    queryFn: async () => {
      if (!communityId) return { count: 0, nonSubscribers: 0 };
      
      logger.log("Fetching mini app users data for community:", communityId);
      
      try {
        // Query mini app users for this community
        const { data: miniAppUsers, error } = await supabase
          .from("mini_app_users")
          .select("telegram_user_id")
          .eq("community_id", communityId);
        
        if (error) {
          logger.error("Error fetching mini app users:", error);
          return { count: 0, nonSubscribers: 0 };
        }
        
        // Count total mini app users
        const count = miniAppUsers?.length || 0;
        
        // Count mini app users who aren't subscribers
        const nonSubscribers = miniAppUsers?.filter(
          user => !activeUserIds.includes(user.telegram_user_id)
        ).length || 0;
        
        return { count, nonSubscribers };
      } catch (error) {
        logger.error("Exception in mini app users fetch:", error);
        return { count: 0, nonSubscribers: 0 };
      }
    },
    enabled: !!communityId
  });
};
