
import { useState } from "react";
import { fetchGroupData } from "../services/inviteLinkService";
import { extractStartParam, logChannelsInfo } from "../utils/inviteLinkUtils";
import { createLogger } from "../../../utils/debugUtils";

const logger = createLogger("useCheckGroupLink");

export const useCheckGroupLink = () => {
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [channels, setChannels] = useState([]);

  /**
   * Check if the link is for a group and fetch channels if it is
   */
  const checkIfGroupLink = async (link: string) => {
    try {
      const startParam = extractStartParam(link);
      if (!startParam) return { success: false };
      
      logger.log(`Checking if ${startParam} is a group`);
      
      // Call the edge function to get community data
      setIsLoadingLink(true);
      
      const groupDataResult = await fetchGroupData(startParam);
      
      if (groupDataResult.error || !groupDataResult.data) {
        setIsLoadingLink(false);
        return { error: groupDataResult.error };
      }
      
      const response = groupDataResult.data;
      
      // If response contains isGroup and channels, it's a group
      if (response.isGroup && response.channels) {
        logger.log('Found group data:', response);
        setIsGroup(true);
        setGroupName(response.groupName || "Group");
        
        if (Array.isArray(response.channels)) {
          logChannelsInfo(response.channels);
          setChannels(response.channels);
        } else {
          logger.warn('No channels array in response or invalid format');
          setChannels([]);
        }
        
        setIsLoadingLink(false);
        return { success: true, isGroup: true };
      }
      
      setIsLoadingLink(false);
      return { success: true, isGroup: false };
    } catch (err) {
      logger.error('Error in checkIfGroupLink:', err);
      setIsLoadingLink(false);
      return { error: err };
    }
  };

  return { 
    checkIfGroupLink,
    isLoadingLink,
    isGroup,
    groupName,
    channels
  };
};
