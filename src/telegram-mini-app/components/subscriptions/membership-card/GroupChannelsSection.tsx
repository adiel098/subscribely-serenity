
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowUpRight } from "lucide-react";
import { GroupChannelsLinks } from "../../success-screen/GroupChannelsLinks";
import { useChannelInviteLink } from "../../../hooks/channel-invitation/useChannelInviteLink";
import { createLogger } from "../../../utils/debugUtils";
import { toast } from "@/components/ui/use-toast";

const logger = createLogger("GroupChannelsSection");

interface GroupChannelsSectionProps {
  isGroup: boolean;
  formattedChannels: {
    id: string;
    name: string;
    inviteLink: string;
    isMiniApp?: boolean;
    type?: string;
  }[] | undefined;
  communityName: string;
  communityId: string;
  communityInviteLink: string | null | undefined;
  onCommunityLinkClick: () => void;
}

export const GroupChannelsSection: React.FC<GroupChannelsSectionProps> = ({
  isGroup,
  formattedChannels,
  communityName,
  communityId,
  communityInviteLink,
  onCommunityLinkClick
}) => {
  const { 
    inviteLink, 
    fetchOrCreateInviteLink, 
    isLoading 
  } = useChannelInviteLink(communityInviteLink);

  // Fetch invite link if not provided
  useEffect(() => {
    if (!communityInviteLink && communityId) {
      logger.log(`No invite link provided for ${communityId}, generating one...`);
      fetchOrCreateInviteLink(communityId);
    }
  }, [communityId, communityInviteLink, fetchOrCreateInviteLink]);

  // Debug logging
  useEffect(() => {
    logger.log(`GroupChannelsSection rendered with:`, {
      communityId,
      communityName,
      communityInviteLink,
      generatedInviteLink: inviteLink,
      isGroup,
      channelsCount: formattedChannels?.length || 0
    });
  }, [communityId, communityName, communityInviteLink, inviteLink, isGroup, formattedChannels]);

  if (isGroup && formattedChannels && formattedChannels.length > 0) {
    return (
      <div className="mt-4">
        <GroupChannelsLinks 
          groupName={communityName} 
          channels={formattedChannels} 
        />
      </div>
    );
  } 
  
  const finalInviteLink = communityInviteLink || inviteLink;

  if (finalInviteLink) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full mt-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 border border-indigo-200 transition-all duration-300"
        onClick={onCommunityLinkClick}
        disabled={isLoading}
      >
        <ArrowUpRight className="h-4 w-4 mr-1.5" />
        {isLoading ? "Opening link..." : "Open Community Channel 🚀"}
      </Button>
    );
  }
  
  return null;
};
