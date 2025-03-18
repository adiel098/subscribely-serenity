
import React, { useState } from "react";
import { toast } from "sonner";
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";
import { Community } from "@/group_owners/hooks/useCommunities";
import { getBotUsername } from "@/telegram-mini-app/utils/telegram/botUsernameUtil";
import { GroupActionButtons } from "./GroupActionButtons";
import { GroupDetailsDialog } from "./GroupDetailsDialog";
import { GroupSuccessBanner } from "./group-success/GroupSuccessBanner";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("GroupMiniAppLinkButton");

interface GroupMiniAppLinkButtonProps {
  group: CommunityGroup;
  communities: Community[];
  showSuccessBanner?: boolean;
}

export const GroupMiniAppLinkButton = ({ 
  group, 
  communities: initialCommunities,
  showSuccessBanner = true // Changed default to true to ensure the banner is shown
}: GroupMiniAppLinkButtonProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
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
        logger.error("Failed to copy link:", error);
        toast.error("Failed to copy link to clipboard");
      });
  };

  const handleGroupUpdated = () => {
    // This will refetch the communities data
    window.location.reload();
  };

  const handleShowDetails = () => {
    setIsDetailsOpen(true);
  };

  return (
    <>
      {showSuccessBanner ? (
        <GroupSuccessBanner
          groupId={group.id}
          customLink={group.custom_link || null}
          onOpenEditDialog={handleShowDetails}
        />
      ) : (
        <GroupActionButtons 
          onCopyLink={handleCopyLink}
          onShowDetails={handleShowDetails}
        />
      )}

      {/* Group Edit Dialog with tabs */}
      <GroupDetailsDialog 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        group={group}
        communities={initialCommunities}
        fullLink={fullLink}
        onCopyLink={handleCopyLink}
        onGroupUpdated={handleGroupUpdated}
        isEditModeByDefault={false} // Changed to false to start in view mode
      />
    </>
  );
};
