
import React, { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";
import { Community } from "@/group_owners/hooks/useCommunities";
import { GroupDialogHeader } from "./dialog-sections/GroupDialogHeader";
import { GroupViewModeContent } from "./dialog-sections/GroupViewModeContent";
import { GroupDialogFooter } from "./dialog-sections/GroupDialogFooter";
import { GroupEditModeContent } from "./dialog-sections/GroupEditModeContent";
import { useGroupDetailsDialog } from "@/group_owners/hooks/useGroupDetailsDialog";
import { useGroupChannels } from "@/group_owners/hooks/useGroupChannels";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("GroupDetailsDialog");

interface GroupDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  group: CommunityGroup;
  communities: Community[];
  fullLink: string;
  onCopyLink: () => void;
  onGroupUpdated: () => void;
  isEditModeByDefault?: boolean;
}

export const GroupDetailsDialog = ({
  isOpen,
  onClose,
  group,
  communities,
  fullLink,
  onCopyLink,
  onGroupUpdated,
  isEditModeByDefault = true,
}: GroupDetailsDialogProps) => {
  // Get channels (member communities) using the edge function
  const { channels, isLoading: isLoadingChannels, channelIds } = useGroupChannels(isOpen ? group.id : null);
  
  const {
    isEditing,
    name,
    description,
    photoUrl,
    customLink,
    selectedCommunityIds,
    activeTab,
    allCommunities,
    isLoadingAllCommunities,
    isPendingUpdate,
    setIsEditing,
    setName,
    setDescription,
    setPhotoUrl,
    setCustomLink,
    setActiveTab,
    setSelectedCommunityIds,
    handleSaveChanges,
    toggleCommunity,
    resetDialogState
  } = useGroupDetailsDialog(
    group,
    communities,
    onGroupUpdated,
    onClose,
    isEditModeByDefault
  );
  
  // Update selected communities when channels are loaded
  useEffect(() => {
    if (isOpen && channels.length > 0 && !isLoadingChannels) {
      logger.log("Setting selected communities from channels:", channelIds);
      setSelectedCommunityIds(channelIds);
    }
  }, [isOpen, channels, channelIds, isLoadingChannels, setSelectedCommunityIds]);
  
  // Reset dialog state when it closes
  useEffect(() => {
    if (!isOpen) {
      resetDialogState();
    }
  }, [isOpen, resetDialogState]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-white to-purple-50">
        <GroupDialogHeader 
          isEditing={isEditing} 
          groupName={group.name} 
        />

        {isEditing ? (
          <GroupEditModeContent
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            photoUrl={photoUrl}
            setPhotoUrl={setPhotoUrl}
            customLink={customLink}
            setCustomLink={setCustomLink}
            allCommunities={allCommunities}
            selectedCommunityIds={selectedCommunityIds}
            toggleCommunity={toggleCommunity}
            isLoadingCommunities={isLoadingAllCommunities || isLoadingChannels}
          />
        ) : (
          <GroupViewModeContent 
            group={group}
            communities={communities}
            channels={channels}
            fullLink={fullLink}
            onCopyLink={onCopyLink}
            onEditLink={() => setIsEditing(true)}
            onEditCommunities={() => {
              setActiveTab('communities');
              setIsEditing(true);
            }}
          />
        )}

        <GroupDialogFooter 
          isEditing={isEditing}
          isPending={isPendingUpdate}
          isFormValid={!!name.trim()}
          onClose={onClose}
          onEdit={() => setIsEditing(true)}
          onSave={handleSaveChanges}
          onCancel={() => setIsEditing(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
