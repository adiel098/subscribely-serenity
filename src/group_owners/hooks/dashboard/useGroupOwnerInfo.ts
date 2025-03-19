
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useGroupOwnerInfo");

export const useGroupOwnerInfo = (groupId: string | null) => {
  return useQuery({
    queryKey: ["groupOwner", groupId],
    queryFn: async () => {
      if (!groupId) return null;
      
      try {
        const { data: group, error } = await supabase
          .from("communities")
          .select("owner_id")
          .eq("id", groupId)
          .eq("is_group", true)
          .single();
        
        if (error || !group) {
          logger.error("Error fetching group owner:", error);
          return null;
        }
        
        const { data: owner, error: ownerError } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", group.owner_id)
          .single();
        
        if (ownerError) {
          logger.error("Error fetching owner profile:", ownerError);
          return null;
        }
        
        return owner;
      } catch (error) {
        logger.error("Exception fetching group owner:", error);
        return null;
      }
    },
    enabled: !!groupId
  });
};
