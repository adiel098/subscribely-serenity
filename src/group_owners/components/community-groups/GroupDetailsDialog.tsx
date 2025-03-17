
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";
import { Community } from "@/group_owners/hooks/useCommunities";
import { GroupPropertyEditSection } from "./GroupPropertyEditSection";
import { useUpdateCommunityGroup } from "@/group_owners/hooks/useUpdateCommunityGroup";
import { toast } from "sonner";
import { GroupDialogHeader } from "./dialog-sections/GroupDialogHeader";
import { GroupViewModeContent } from "./dialog-sections/GroupViewModeContent";
import { GroupDialogFooter } from "./dialog-sections/GroupDialogFooter";

interface GroupDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  group: CommunityGroup;
  communities: Community[];
  fullLink: string;
  onCopyLink: () => void;
  onEditLink: () => void;
  onEditCommunities: () => void;
  isEditModeByDefault?: boolean;
}

export const GroupDetailsDialog = ({
  isOpen,
  onClose,
  group,
  communities,
  fullLink,
  onCopyLink,
  onEditLink,
  onEditCommunities,
  isEditModeByDefault = true,
}: GroupDetailsDialogProps) => {
  const [isEditing, setIsEditing] = useState(isEditModeByDefault);
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || "");
  const [photoUrl, setPhotoUrl] = useState(group.telegram_photo_url || "");
  
  const updateGroupMutation = useUpdateCommunityGroup();
  
  // Reset form state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setIsEditing(isEditModeByDefault);
      setName(group.name);
      setDescription(group.description || "");
      setPhotoUrl(group.telegram_photo_url || "");
    }
  }, [isOpen, group, isEditModeByDefault]);
  
  const handleSaveChanges = () => {
    updateGroupMutation.mutate(
      {
        id: group.id,
        name,
        description: description || null,
        photo_url: photoUrl || null
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success("Group details updated successfully!");
        },
        onError: (error) => {
          toast.error(`Failed to update group: ${error.message}`);
        }
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <GroupDialogHeader 
          isEditing={isEditing} 
          groupName={group.name} 
        />

        {isEditing ? (
          <GroupPropertyEditSection 
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            photoUrl={photoUrl}
            setPhotoUrl={setPhotoUrl}
          />
        ) : (
          <GroupViewModeContent 
            group={group}
            communities={communities}
            fullLink={fullLink}
            onCopyLink={onCopyLink}
            onEditLink={onEditLink}
            onEditCommunities={onEditCommunities}
          />
        )}

        <GroupDialogFooter 
          isEditing={isEditing}
          isPending={updateGroupMutation.isPending}
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
