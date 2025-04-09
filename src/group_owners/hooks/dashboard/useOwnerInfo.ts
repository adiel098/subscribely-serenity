
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useOwnerInfo");

export const useOwnerInfo = (communityId: string | null) => {
  return useQuery({
    queryKey: ["community-owner", communityId],
    queryFn: async () => {
      if (!communityId) return null;
      
      logger.log("Fetching owner info for community:", communityId);
      
      try {
        // First, get the owner ID from the community
        const { data: community, error: communityError } = await supabase
          .from("communities")
          .select("owner_id")
          .eq("id", communityId)
          .single();
        
        if (communityError) {
          logger.error("Error fetching community:", communityError);
          return null;
        }
        
        // Then, get the owner details
        const { data: owner, error: ownerError } = await supabase
          .from("users")
          .select("id, email, telegram_username, telegram_user_id")
          .eq("id", community.owner_id)
          .single();
        
        if (ownerError) {
          logger.error("Error fetching owner:", ownerError);
          return null;
        }
        
        return owner;
      } catch (error) {
        logger.error("Exception in owner info fetch:", error);
        return null;
      }
    },
    enabled: !!communityId
  });
};
