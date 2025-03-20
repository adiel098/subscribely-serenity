
import { useState, useEffect } from "react";
import { parseInviteLinkJson, logChannelsInfo } from "../utils/inviteLinkUtils";
import { useGenerateInviteLink } from "./useGenerateInviteLink";
import { useCheckGroupLink } from "./useCheckGroupLink";
import { ChannelLink } from "../types/inviteLink.types";
import { createLogger } from "../../../utils/debugUtils";

const logger = createLogger("useInviteLink");

export const useInviteLink = (initialInviteLink: string | null) => {
  const [inviteLink, setInviteLink] = useState<string | null>(initialInviteLink);
  const [isLoadingLink, setIsLoadingLink] = useState<boolean>(false);
  const [isGroup, setIsGroup] = useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>("");
  const [channels, setChannels] = useState<ChannelLink[]>([]);
  
  const generateInviteLinkHook = useGenerateInviteLink();
  const checkGroupLinkHook = useCheckGroupLink();
  
  // Process initial invite link or generate a new one
  useEffect(() => {
    logger.log('Community invite link in useInviteLink:', initialInviteLink);
    
    if (initialInviteLink) {
      setInviteLink(initialInviteLink);
      
      // Try to parse the invite link as JSON first (for group links)
      const parsedData = parseInviteLinkJson(initialInviteLink);
      
      if (parsedData) {
        // This is a group link stored as JSON
        setIsGroup(true);
        setGroupName(parsedData.groupName || "Group");
        
        if (parsedData.channels && Array.isArray(parsedData.channels)) {
          logChannelsInfo(parsedData.channels);
          setChannels(parsedData.channels || []);
        } else {
          logger.warn('No channels array in parsed data or invalid format');
          setChannels([]);
        }
        
        setInviteLink(parsedData.mainGroupLink);
        return;
      }
      
      // Check if this is a group link by extracting parameters
      if (initialInviteLink.includes('start=')) {
        setIsLoadingLink(true);
        checkGroupLinkHook.checkIfGroupLink(initialInviteLink)
          .then(result => {
            if (result.isGroup) {
              setIsGroup(checkGroupLinkHook.isGroup);
              setGroupName(checkGroupLinkHook.groupName);
              setChannels(checkGroupLinkHook.channels);
            }
            setIsLoadingLink(false);
          });
      }
    } else {
      // Generate a new invite link
      setIsLoadingLink(true);
      generateInviteLinkHook.generateNewInviteLink()
        .then(() => {
          setInviteLink(generateInviteLinkHook.inviteLink);
          setIsGroup(generateInviteLinkHook.isGroup);
          setGroupName(generateInviteLinkHook.groupName);
          setChannels(generateInviteLinkHook.channels);
          setIsLoadingLink(false);
        });
    }
  }, [initialInviteLink]);

  return { 
    inviteLink, 
    isLoadingLink: isLoadingLink || generateInviteLinkHook.isLoadingLink || checkGroupLinkHook.isLoadingLink, 
    isGroup, 
    groupName, 
    channels 
  };
};
