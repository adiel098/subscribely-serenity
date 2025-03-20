
import { useState } from "react";
import { fetchRecentPayment, fetchGroupData, updatePaymentWithInviteLink } from "../services/inviteLinkService";
import { logChannelsInfo } from "../utils/inviteLinkUtils";
import { createLogger } from "../../../utils/debugUtils";

const logger = createLogger("useGenerateInviteLink");

export const useGenerateInviteLink = () => {
  const [isLoadingLink, setIsLoadingLink] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [channels, setChannels] = useState([]);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  /**
   * Generate a fresh invite link for this member
   */
  const generateNewInviteLink = async () => {
    setIsLoadingLink(true);
    try {
      logger.log('Generating new invite link...');
      
      // Get community ID from recent payment
      const paymentResult = await fetchRecentPayment();
      
      if (paymentResult.error || !paymentResult.data) {
        setIsLoadingLink(false);
        return { error: paymentResult.error };
      }
      
      const { communityId, paymentId } = paymentResult.data;
      
      logger.log(`Found community ID for invite link generation: ${communityId}`);
      
      // Call the create-invite-link edge function
      const groupDataResult = await fetchGroupData(communityId);
      
      if (groupDataResult.error || !groupDataResult.data) {
        setIsLoadingLink(false);
        return { error: groupDataResult.error };
      }
      
      const response = groupDataResult.data;
      
      // Handle group data if present
      if (response.isGroup) {
        logger.log('Received group data from invite link generation:', response);
        setIsGroup(true);
        setGroupName(response.groupName || "Group");
        
        if (Array.isArray(response.channels)) {
          logChannelsInfo(response.channels);
          setChannels(response.channels || []);
        } else {
          logger.warn('No channels array in response or invalid format');
          setChannels([]);
        }
        
        // If this is a group, store the complete JSON structure
        if (response.inviteLink) {
          // This is the JSON stringified version of all channel links
          logger.log('Storing complete JSON of group links');
          
          const storeLink = response.inviteLink;
          setInviteLink(response.directAccess?.mainGroupLink || null);
          
          // Update the most recent payment with the complete JSON structure of links
          await updatePaymentWithInviteLink(paymentId, storeLink);
          
          setIsLoadingLink(false);
          return { success: true };
        }
      }
      
      if (response.inviteLink) {
        logger.log('Generated new invite link:', response.inviteLink);
        setInviteLink(response.inviteLink);
        
        // Update the most recent payment with the new link
        await updatePaymentWithInviteLink(paymentId, response.inviteLink);
      } else {
        logger.error('No invite link received from function');
      }
      
      setIsLoadingLink(false);
      return { success: true };
    } catch (err) {
      logger.error('Error in generateNewInviteLink:', err);
      setIsLoadingLink(false);
      return { error: err };
    }
  };

  return { 
    generateNewInviteLink,
    isLoadingLink,
    isGroup,
    groupName,
    channels,
    inviteLink,
    setInviteLink
  };
};
