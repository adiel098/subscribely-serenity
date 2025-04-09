
import { useQuery } from "@tanstack/react-query";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useCommunityRelationships");

// Temporary implementation since community_relationships table was deleted
export const useCommunityRelationships = (communityId: string | null) => {
  return useQuery({
    queryKey: ["community-relationships", communityId],
    queryFn: async () => {
      logger.log("Community relationships requested but table was removed");
      return { members: [], groups: [] };
    },
    enabled: !!communityId
  });
};
