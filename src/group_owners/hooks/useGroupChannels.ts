
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useGroupChannels");

interface Channel {
  id: string;
  name: string;
  type: string;
  description?: string;
}

interface ChannelsResponse {
  isGroup: boolean;
  channels: Channel[];
}

export function useGroupChannels(groupId: string | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["group-channels", groupId],
    queryFn: async (): Promise<ChannelsResponse> => {
      if (!groupId) {
        logger.log("No group ID provided, returning empty channels list");
        return { isGroup: false, channels: [] };
      }
      
      try {
        logger.log("Fetching channels for group ID:", groupId);
        
        const { data, error } = await supabase.functions.invoke("get-community-channels", {
          body: { communityId: groupId }
        });
        
        if (error) {
          logger.error("Error fetching group channels:", error);
          throw error;
        }
        
        logger.log(`Retrieved ${data?.channels?.length || 0} channels for group ${groupId}`, data);
        
        return data || { isGroup: false, channels: [] };
      } catch (error) {
        logger.error("Error in useGroupChannels:", error);
        return { isGroup: false, channels: [] };
      }
    },
    enabled: !!groupId,
    staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes to avoid excessive fetching
    gcTime: 1000 * 60 * 10,   // Cache garbage collection after 10 minutes
    retry: 1,                  // Only retry once to avoid excessive attempts
  });
  
  // Extract just the community IDs for convenience
  const channelIds = data?.channels ? data.channels.map(channel => channel.id) : [];
  
  return {
    isGroup: data?.isGroup || false,
    channels: data?.channels || [],
    isLoading,
    error,
    channelIds
  };
}
