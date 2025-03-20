
import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { GroupChannelsLinks } from "../../success-screen/GroupChannelsLinks";
import { ChannelType } from "../../../hooks/useCommunityChannels";

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
  communityInviteLink: string | null | undefined;
  onCommunityLinkClick: () => void;
}

export const GroupChannelsSection: React.FC<GroupChannelsSectionProps> = ({
  isGroup,
  formattedChannels,
  communityName,
  communityInviteLink,
  onCommunityLinkClick
}) => {
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
  
  if (communityInviteLink) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full mt-2 bg-purple-500/10 text-purple-700 hover:bg-purple-500/20 hover:text-purple-800 border border-purple-200 transition-all duration-300"
        onClick={onCommunityLinkClick}
      >
        <ExternalLink className="h-4 w-4 mr-1.5" />
        Visit Community ✨
      </Button>
    );
  }
  
  return null;
};
