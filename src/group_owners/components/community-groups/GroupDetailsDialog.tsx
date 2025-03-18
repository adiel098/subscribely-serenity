
import React, { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";
import { Community } from "@/group_owners/hooks/useCommunities";
import { useGroupDetailsDialog } from "@/group_owners/hooks/useGroupDetailsDialog";
import { useGroupChannels } from "@/group_owners/hooks/useGroupChannels";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";
import { communitiesToChannels } from "@/group_owners/utils/channelTransformers";
import { SingleTabGroupContent } from "./dialog-sections/SingleTabGroupContent";
import { GroupDialogHeader } from "./dialog-sections/GroupDialogHeader";
import { GroupDialogFooter } from "./dialog-sections/GroupDialogFooter";

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
    allCommunities,
    isLoadingAllCommunities,
    isPendingUpdate,
    setIsEditing,
    setName,
    setDescription,
    setPhotoUrl,
    setCustomLink,
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
    // Verify channelIds is an array and has content
    if (isOpen && !isLoadingChannels && channelIds && Array.isArray(channelIds) && channelIds.length > 0) {
      logger.log("Setting selected communities from channels:", channelIds);
      setSelectedCommunityIds(channelIds);
    }
  }, [isOpen, channelIds, isLoadingChannels, setSelectedCommunityIds]);
  
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

  // Make sure channels is an array
  const safeChannels = Array.isArray(channels) ? channels : [];
  
  // Transform the Community objects to Channel objects
  const transformedChannels = communitiesToChannels(safeChannels);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-white to-purple-50">
        <GroupDialogHeader 
          isEditing={isEditing} 
          groupName={group.name} 
        />

        <SingleTabGroupContent 
          group={group}
          isEditing={isEditing}
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          photoUrl={photoUrl}
          setPhotoUrl={setPhotoUrl}
          customLink={customLink}
          setCustomLink={setCustomLink}
          allCommunities={allCommunities || []}
          selectedCommunityIds={selectedCommunityIds}
          toggleCommunity={toggleCommunity}
          isLoadingCommunities={isLoadingAllCommunities || isLoadingChannels}
          channels={transformedChannels}
          fullLink={fullLink}
          onCopyLink={onCopyLink}
          onEditLink={() => setIsEditing(true)}
        />

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
