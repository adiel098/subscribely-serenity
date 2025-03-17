
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
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { GroupCommunitySelection } from "./dialog-sections/GroupCommunitySelection";

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
  const [isEditing, setIsEditing] = useState(isEditModeByDefault);
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || "");
  const [photoUrl, setPhotoUrl] = useState(group.telegram_photo_url || "");
  const [customLink, setCustomLink] = useState(group.custom_link || "");
  const [selectedCommunityIds, setSelectedCommunityIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'communities'>('details');
  
  // Get all communities for selection
  const { data: allCommunities, isLoading: isLoadingAllCommunities } = useCommunities();
  
  const updateGroupMutation = useUpdateCommunityGroup();
  
  // Reset form state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setIsEditing(isEditModeByDefault);
      setName(group.name);
      setDescription(group.description || "");
      setPhotoUrl(group.telegram_photo_url || "");
      setCustomLink(group.custom_link || "");
      setActiveTab('details');
      
      // Initialize selected communities from current communities
      if (communities && communities.length > 0) {
        setSelectedCommunityIds(communities.map(c => c.id));
      } else {
        setSelectedCommunityIds([]);
      }
    }
  }, [isOpen, group, communities, isEditModeByDefault]);
  
  const handleSaveChanges = () => {
    updateGroupMutation.mutate(
      {
        id: group.id,
        name,
        description: description || null,
        photo_url: photoUrl || null,
        custom_link: customLink || null,
        communities: selectedCommunityIds
      },
      {
        onSuccess: () => {
          toast.success("Group details updated successfully!");
          onGroupUpdated();
          onClose();
        },
        onError: (error) => {
          toast.error(`Failed to update group: ${error.message}`);
        }
      }
    );
  };

  // Toggle community selection
  const toggleCommunity = (communityId: string) => {
    setSelectedCommunityIds(prev => 
      prev.includes(communityId)
        ? prev.filter(id => id !== communityId)
        : [...prev, communityId]
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
          <div className="space-y-4">
            {/* Tabs for switching between details and communities */}
            <div className="flex border-b">
              <button
                className={`px-4 py-2 ${activeTab === 'details' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('details')}
              >
                Group Details
              </button>
              <button
                className={`px-4 py-2 ${activeTab === 'communities' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('communities')}
              >
                Communities
              </button>
            </div>

            {activeTab === 'details' ? (
              <GroupPropertyEditSection 
                name={name}
                setName={setName}
                description={description}
                setDescription={setDescription}
                photoUrl={photoUrl}
                setPhotoUrl={setPhotoUrl}
                customLink={customLink}
                setCustomLink={setCustomLink}
              />
            ) : (
              <GroupCommunitySelection
                allCommunities={allCommunities || []}
                selectedCommunityIds={selectedCommunityIds}
                toggleCommunity={toggleCommunity}
                isLoading={isLoadingAllCommunities}
              />
            )}
          </div>
        ) : (
          <GroupViewModeContent 
            group={group}
            communities={communities}
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
