
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MiniAppData, DashboardSubscriber } from "./types";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useGroupMiniAppUsers");

export const useGroupMiniAppUsers = (
  groupId: string | null, 
  activeSubscribers: DashboardSubscriber[]
) => {
  return useQuery({
    queryKey: ["groupMiniAppUsers", groupId],
    queryFn: async () => {
      if (!groupId) return { count: 0, nonSubscribers: 0 };
      
      try {
        const { data: miniAppUsers, error } = await supabase
          .from("telegram_mini_app_users")
          .select("*")
          .eq("community_id", groupId);
        
        if (error) {
          logger.error("Error fetching group mini app users:", error);
          return { count: 0, nonSubscribers: 0 };
        }
        
        // Get the telegram_user_ids of active subscribers
        const activeUserIds = activeSubscribers.map(sub => sub.telegram_user_id);
        
        // Count non-subscribers
        const nonSubscribersCount = miniAppUsers.filter(
          user => !activeUserIds.includes(user.telegram_id)
        ).length;
        
        return {
          count: miniAppUsers.length,
          nonSubscribers: nonSubscribersCount,
          users: miniAppUsers
        };
      } catch (error) {
        logger.error("Exception fetching group mini app users:", error);
        return { count: 0, nonSubscribers: 0 };
      }
    },
    enabled: !!groupId && activeSubscribers.length > 0
  });
};
