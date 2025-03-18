
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Community } from "./useCommunities";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useGroupChannels");

export const useGroupChannels = (groupId: string | null) => {
  const queryClient = useQueryClient();

  const { data: result, isLoading, error } = useQuery({
    queryKey: ["community-group-members", groupId],
    queryFn: async () => {
      if (!groupId) {
        return { channels: [], channelIds: [] };
      }
      
      try {
        logger.log(`Fetching channels for group: ${groupId} using edge function`);
        
        // Call the edge function to get communities in this group
        const { data, error } = await supabase.functions.invoke("get-community-channels", {
          body: { communityId: groupId }
        });
        
        if (error) {
          logger.error("Error fetching group channels from edge function:", error);
          throw error;
        }
        
        if (!data || !data.channels) {
          logger.log("No channels returned from edge function");
          return { channels: [], channelIds: [] };
        }
        
        // Transform the edge function response to Community objects
        const communities: Community[] = data.channels.map(channel => ({
          id: channel.id,
          name: channel.name,
          description: channel.description || null,
          telegram_photo_url: channel.telegram_photo_url || null,
          telegram_chat_id: null,   // The edge function doesn't return this currently
          custom_link: channel.custom_link || null,
          owner_id: "", // This field isn't used in the current context
          created_at: "",
          updated_at: ""
        }));
        
        logger.log(`Retrieved ${communities.length} communities from edge function:`, communities);
        
        return { 
          channels: communities,
          channelIds: communities.map(c => c.id)
        };
      } catch (error) {
        logger.error("Error in useGroupChannels:", error);
        return { channels: [], channelIds: [] };
      }
    },
    enabled: !!groupId,
    staleTime: 30000, // 30 second cache
    gcTime: 300000, // 5 minutes garbage collection time
    refetchOnWindowFocus: false
  });
  
  // This function can be called after successful updates to the group communities
  const invalidateCache = () => {
    if (groupId) {
      logger.log(`Invalidating cache for group: ${groupId}`);
      queryClient.invalidateQueries({ queryKey: ["community-group-members", groupId] });
    }
  };
  
  return {
    channels: result?.channels || [],
    channelIds: result?.channelIds || [],
    isLoading,
    error,
    invalidateCache
  };
};
