
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useOwnerInfo");

export const useOwnerInfo = (communityId: string) => {
  return useQuery({
    queryKey: ["communityOwner", communityId],
    queryFn: async () => {
      if (!communityId) {
        logger.log("Cannot fetch owner: No community ID provided");
        return null;
      }
      
      logger.log("Fetching community owner for community ID:", communityId);
      
      try {
        const { data: community, error } = await supabase
          .from("communities")
          .select("owner_id")
          .eq("id", communityId)
          .maybeSingle();

        if (error || !community) {
          logger.error("Error fetching community owner:", error);
          return null;
        }

        logger.log("Found owner_id:", community.owner_id);

        const { data: owner, error: ownerError } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", community.owner_id)
          .maybeSingle();

        if (ownerError) {
          logger.error("Error fetching owner profile:", ownerError);
          return null;
        }

        logger.log("Successfully fetched owner profile:", owner);
        return owner;
      } catch (error) {
        logger.error("Exception fetching owner info:", error);
        return null;
      }
    },
    enabled: !!communityId
  });
};
