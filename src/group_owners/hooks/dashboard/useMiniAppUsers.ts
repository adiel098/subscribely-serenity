
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useMiniAppUsers");

export const useMiniAppUsers = (
  communityId: string,
  activeUserIds: string[]
) => {
  return useQuery({
    queryKey: ["miniAppUsers", communityId],
    queryFn: async () => {
      if (!communityId) return { count: 0, nonSubscribers: 0 };
      
      console.log("🔍 Fetching mini app users for community ID:", communityId);
      
      try {
        const { data: miniAppUsers, error } = await supabase
          .from("telegram_mini_app_users")
          .select("*")
          .eq("community_id", communityId);
        
        if (error) {
          logger.error("Error fetching mini app users:", error);
          return { count: 0, nonSubscribers: 0 };
        }
        
        console.log("📱 Fetched mini app users:", miniAppUsers.length);
        
        // Count non-subscribers (users who have used the mini app but aren't active subscribers)
        const nonSubscribersCount = miniAppUsers.filter(
          user => !activeUserIds.includes(user.telegram_id)
        ).length;
        
        return {
          count: miniAppUsers.length,
          nonSubscribers: nonSubscribersCount,
          users: miniAppUsers
        };
      } catch (error) {
        logger.error("Exception fetching mini app users:", error);
        return { count: 0, nonSubscribers: 0 };
      }
    },
    enabled: !!communityId && activeUserIds.length > 0
  });
};
