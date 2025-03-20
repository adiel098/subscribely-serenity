
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChannelLink } from "../types/inviteLink.types";
import { createLogger } from "../../../utils/debugUtils";

const logger = createLogger("useCheckGroupLink");

export const useCheckGroupLink = () => {
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [channels, setChannels] = useState<ChannelLink[]>([]);
  const [error, setError] = useState<string | null>(null);

  const checkIfGroupLink = async (link: string) => {
    try {
      setIsLoadingLink(true);
      setError(null);
      
      const startParamMatch = link.match(/start=([^&]+)/);
      if (!startParamMatch) {
        setIsLoadingLink(false);
        return { isGroup: false };
      }
      
      const startParam = startParamMatch[1];
      logger.log(`Checking if ${startParam} is a group`);
      
      // Call the edge function to get community data
      const response = await supabase.functions.invoke('create-invite-link', {
        body: { 
          communityId: startParam
        }
      });
      
      logger.log('Response from create-invite-link:', response);
      
      if (response.error) {
        logger.error('Error checking if group link:', response.error);
        setError(response.error.message);
        setIsLoadingLink(false);
        return { isGroup: false, error: response.error };
      }
      
      // If response contains isGroup and channels, it's a group
      if (response.data?.isGroup && response.data?.channels) {
        logger.log('Found group data:', response.data);
        setIsGroup(true);
        setGroupName(response.data.groupName || "Group");
        
        if (Array.isArray(response.data.channels)) {
          logger.log(`Found ${response.data.channels.length} channels in response`);
          
          const channelLinks: ChannelLink[] = response.data.channels.map((channel: any) => ({
            id: channel.id,
            name: channel.name,
            inviteLink: channel.telegram_invite_link || null,
            isMiniApp: false
          }));
          
          setChannels(channelLinks);
          
          setIsLoadingLink(false);
          return { 
            isGroup: true, 
            groupName: response.data.groupName,
            channels: channelLinks 
          };
        } else {
          logger.warn('No channels array in response or invalid format');
          setChannels([]);
        }
      }
      
      setIsLoadingLink(false);
      return { isGroup: false };
    } catch (err) {
      logger.error('Error in checkIfGroupLink:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoadingLink(false);
      return { isGroup: false, error: err };
    }
  };

  return {
    checkIfGroupLink,
    isLoadingLink,
    isGroup,
    groupName,
    channels,
    error
  };
};
