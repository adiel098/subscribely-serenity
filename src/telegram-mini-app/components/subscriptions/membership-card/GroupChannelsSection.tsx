
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
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
        className="w-full mt-2 bg-purple-500/10 text-purple-700 hover:bg-purple-500/20 hover:text-purple-800 border border-purple-200 transition-all duration-300"
        onClick={onCommunityLinkClick}
        disabled={isLoading}
      >
        <ExternalLink className="h-4 w-4 mr-1.5" />
        {isLoading ? "Loading link..." : "Visit Community ✨"}
      </Button>
    );
  }
  
  return null;
};
