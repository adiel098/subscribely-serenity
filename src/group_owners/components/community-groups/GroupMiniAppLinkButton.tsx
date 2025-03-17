
import React, { useState } from "react";
import { toast } from "sonner";
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";
import { Community } from "@/group_owners/hooks/useCommunities";
import { getBotUsername } from "@/telegram-mini-app/utils/telegram/botUsernameUtil";
import { useGroupMemberCommunities } from "@/group_owners/hooks/useGroupMemberCommunities";
import { GroupActionButtons } from "./GroupActionButtons";
import { GroupDetailsDialog } from "./GroupDetailsDialog";

interface GroupMiniAppLinkButtonProps {
  group: CommunityGroup;
  communities: Community[];
}

export const GroupMiniAppLinkButton = ({ 
  group, 
  communities: initialCommunities 
}: GroupMiniAppLinkButtonProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Use the hook to get and refresh member communities
  const { communities, isLoading, communityIds } = useGroupMemberCommunities(group.id);
  
  const botUsername = getBotUsername();
  
  // Build the link using either custom_link or group ID (without the group_ prefix)
  const baseUrl = `https://t.me/${botUsername}?start=`;
  const fullLink = `${baseUrl}${group.custom_link || group.id.replace('group_', '')}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullLink)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch((error) => {
        console.error("Failed to copy link:", error);
        toast.error("Failed to copy link to clipboard");
      });
  };

  const handleGroupUpdated = () => {
    // This will refetch the communities data
    window.location.reload();
  };

  return (
    <>
      <GroupActionButtons 
        onCopyLink={handleCopyLink}
        onShowDetails={() => setIsDetailsOpen(true)}
      />

      {/* Unified Group Details Dialog */}
      <GroupDetailsDialog 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        group={group}
        communities={communities}
        fullLink={fullLink}
        onCopyLink={handleCopyLink}
        onGroupUpdated={handleGroupUpdated}
        isEditModeByDefault={true} // Open directly in edit mode
      />
    </>
  );
};
