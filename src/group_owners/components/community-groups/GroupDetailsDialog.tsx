
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
import { communitiesToChannels } from "@/group_owners/utils/channelTransformers";

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
  const { channels, isLoading: isLoadingChannels, channelIds, invalidateCache } = useGroupChannels(
    isOpen ? group.id : null
  );
  
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
  
  // Update selected communities when channels are loaded - only once per dialog opening
  useEffect(() => {
    if (isOpen && channels.length > 0 && !isLoadingChannels && channelIds.length > 0) {
      // Use JSON.stringify for deep comparison of arrays to prevent infinite loops
      const currentIdsSet = JSON.stringify([...selectedCommunityIds].sort());
      const newIdsSet = JSON.stringify([...channelIds].sort());
      
      if (currentIdsSet !== newIdsSet) {
        logger.log("Setting selected communities from channels:", channelIds);
        setSelectedCommunityIds(channelIds);
      }
    }
  }, [isOpen, channels, channelIds, isLoadingChannels, selectedCommunityIds, setSelectedCommunityIds]);
  
  // Reset dialog state when it closes
  useEffect(() => {
    if (!isOpen) {
      resetDialogState();
    }
  }, [isOpen, resetDialogState]);

  // After save is complete, invalidate the cache to refresh the channels list
  const handleSaveWithInvalidation = async () => {
    await handleSaveChanges();
    // Invalidate the cache to refresh the channels list
    invalidateCache();
  };

  // Transform the Community objects to Channel objects
  const transformedChannels = channels.length > 0 
    ? communitiesToChannels(channels) 
    : [];

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
            channels={transformedChannels}
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
          onSave={handleSaveWithInvalidation}
          onCancel={() => setIsEditing(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
