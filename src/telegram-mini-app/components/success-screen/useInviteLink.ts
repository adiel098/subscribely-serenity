
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "../../utils/debugUtils";

const logger = createLogger("useInviteLink");

interface ChannelLink {
  id: string;
  name: string;
  inviteLink: string;
  description?: string;
  isMiniApp?: boolean;
  error?: string;
}

interface GroupInviteData {
  mainGroupLink: string;
  isGroup: boolean;
  groupName: string;
  channels: ChannelLink[];
}

export const useInviteLink = (initialInviteLink: string | null) => {
  const [inviteLink, setInviteLink] = useState<string | null>(initialInviteLink);
  const [isLoadingLink, setIsLoadingLink] = useState<boolean>(false);
  const [isGroup, setIsGroup] = useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>("");
  const [channels, setChannels] = useState<ChannelLink[]>([]);
  
  // Process initial invite link or generate a new one
  useEffect(() => {
    logger.log('Community invite link in useInviteLink:', initialInviteLink);
    
    if (initialInviteLink) {
      setInviteLink(initialInviteLink);
      
      // Try to parse the invite link as JSON first (for group links)
      try {
        const parsedData = JSON.parse(initialInviteLink);
        logger.log('Successfully parsed invite link as JSON:', parsedData);
        
        if (parsedData.isGroup) {
          // This is a group link stored as JSON
          setIsGroup(true);
          setGroupName(parsedData.groupName || "Group");
          
          if (parsedData.channels && Array.isArray(parsedData.channels)) {
            logger.log(`Found ${parsedData.channels.length} channels in parsed data`);
            parsedData.channels.forEach((channel: ChannelLink, index: number) => {
              logger.log(`Channel ${index + 1}: ${channel.name} - Link: ${(channel.inviteLink || '').substring(0, 30)}... - isMiniApp: ${channel.isMiniApp || false}`);
            });
            setChannels(parsedData.channels || []);
          } else {
            logger.warn('No channels array in parsed data or invalid format');
            setChannels([]);
          }
          
          setInviteLink(parsedData.mainGroupLink);
          return;
        }
      } catch (err) {
        // Not a JSON string, continue with normal processing
        logger.log('Invite link is not in JSON format, processing as regular link');
      }
      
      // Check if this is a group link by extracting parameters
      if (initialInviteLink.includes('start=')) {
        checkIfGroupLink(initialInviteLink);
      }
    } else {
      // Generate a new invite link
      generateNewInviteLink();
    }
  }, [initialInviteLink]);

  // Check if the link is for a group and fetch channels if it is
  const checkIfGroupLink = async (link: string) => {
    try {
      const startParamMatch = link.match(/start=([^&]+)/);
      if (!startParamMatch) return;
      
      const startParam = startParamMatch[1];
      logger.log(`Checking if ${startParam} is a group`);
      
      // Call the edge function to get community data
      setIsLoadingLink(true);
      const response = await supabase.functions.invoke('create-invite-link', {
        body: { 
          communityId: startParam
        }
      });
      
      logger.log('Response from create-invite-link:', response);
      
      if (response.error) {
        logger.error('Error checking if group link:', response.error);
        setIsLoadingLink(false);
        return;
      }
      
      // If response contains isGroup and channels, it's a group
      if (response.data?.isGroup && response.data?.channels) {
        logger.log('Found group data:', response.data);
        setIsGroup(true);
        setGroupName(response.data.groupName || "Group");
        
        if (Array.isArray(response.data.channels)) {
          logger.log(`Found ${response.data.channels.length} channels in response`);
          response.data.channels.forEach((channel: ChannelLink, index: number) => {
            logger.log(`Channel ${index + 1}: ${channel.name} - Link: ${(channel.inviteLink || '').substring(0, 30)}... - isMiniApp: ${channel.isMiniApp || false}`);
          });
          setChannels(response.data.channels);
        } else {
          logger.warn('No channels array in response or invalid format');
          setChannels([]);
        }
      }
      setIsLoadingLink(false);
    } catch (err) {
      logger.error('Error in checkIfGroupLink:', err);
      setIsLoadingLink(false);
    }
  };

  // Generate a fresh invite link for this member
  const generateNewInviteLink = async () => {
    setIsLoadingLink(true);
    try {
      logger.log('Generating new invite link...');
      
      // Get community ID from recent payment
      const { data: recentPayment, error: paymentError } = await supabase
        .from('project_payments')
        .select('id, project_id')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (paymentError) {
        logger.error('Error fetching recent payment:', paymentError);
        setIsLoadingLink(false);
        return;
      }
      
      if (!recentPayment || recentPayment.length === 0 || !recentPayment[0].community_id) {
        logger.error('No recent payment or community ID found');
        setIsLoadingLink(false);
        return;
      }
      
      const communityId = recentPayment[0].community_id;
      const paymentId = recentPayment[0].id;
      
      logger.log(`Found community ID for invite link generation: ${communityId}`);
      
      // Call the create-invite-link edge function
      const response = await supabase.functions.invoke('create-invite-link', {
        body: { 
          communityId: communityId,
          forceNew: true 
        }
      });
      
      logger.log('Response from create-invite-link:', response);
      
      if (response.error) {
        logger.error('Error generating invite link:', response.error);
        setIsLoadingLink(false);
        return;
      }
      
      // Handle group data if present
      if (response.data?.isGroup) {
        logger.log('Received group data from invite link generation:', response.data);
        setIsGroup(true);
        setGroupName(response.data.groupName || "Group");
        
        if (Array.isArray(response.data.channels)) {
          logger.log(`Found ${response.data.channels.length} channels in response`);
          response.data.channels.forEach((channel: ChannelLink, index: number) => {
            logger.log(`Channel ${index + 1}: ${channel.name} - Link: ${(channel.inviteLink || '').substring(0, 30)}... - isMiniApp: ${channel.isMiniApp || false}`);
          });
          setChannels(response.data.channels || []);
        } else {
          logger.warn('No channels array in response or invalid format');
          setChannels([]);
        }
        
        // If this is a group, store the complete JSON structure
        if (response.data.inviteLink) {
          // This is the JSON stringified version of all channel links
          logger.log('Storing complete JSON of group links');
          
          const storeLink = response.data.inviteLink;
          setInviteLink(response.data.directAccess?.mainGroupLink || null);
          
          // Update the most recent payment with the complete JSON structure of links
          const { error: updateError } = await supabase
            .from('project_payments')
            .update({ invite_link: storeLink })
            .eq('id', paymentId);
            
          if (updateError) {
            logger.error('Error updating payment with JSON invite links:', updateError);
          } else {
            logger.log('Updated payment record with JSON invite links structure');
          }
          
          return;
        }
      }
      
      if (response.data?.inviteLink) {
        logger.log('Generated new invite link:', response.data.inviteLink);
        setInviteLink(response.data.inviteLink);
        
        // Update the most recent payment with the new link
        const { error: updateError } = await supabase
          .from('project_payments')
          .update({ invite_link: response.data.inviteLink })
          .eq('id', paymentId);
          
        if (updateError) {
          logger.error('Error updating payment with new invite link:', updateError);
        } else {
          logger.log('Updated payment record with new invite link');
        }
      } else {
        logger.error('No invite link received from function');
      }
    } catch (err) {
      logger.error('Error in generateNewInviteLink:', err);
    } finally {
      setIsLoadingLink(false);
    }
  };

  return { inviteLink, isLoadingLink, isGroup, groupName, channels };
};
