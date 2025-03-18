
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
import { useGroupMemberCommunities } from "@/group_owners/hooks/useGroupMemberCommunities";

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
  
  // Fetch member communities for the current group
  const { communities: groupCommunities, isLoading: isLoadingGroupCommunities } = useGroupMemberCommunities(group.id);
  
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
      // We prioritize communities fetched by useGroupMemberCommunities over props
      if (groupCommunities && groupCommunities.length > 0) {
        console.log("Using fetched groupCommunities:", groupCommunities.map(c => c.name));
        setSelectedCommunityIds(groupCommunities.map(c => c.id));
      } else if (communities && communities.length > 0) {
        console.log("Using prop communities:", communities.map(c => c.name));
        setSelectedCommunityIds(communities.map(c => c.id));
      } else {
        console.log("No communities found for group");
        setSelectedCommunityIds([]);
      }
    }
  }, [isOpen, group, communities, isEditModeByDefault, groupCommunities]);
  
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
          toast.success("Group details updated successfully! 🎉");
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

  // Determine which communities to display
  const communitiesForDisplay = groupCommunities?.length > 0 ? groupCommunities : communities;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-white to-purple-50">
        <GroupDialogHeader 
          isEditing={isEditing} 
          groupName={group.name} 
        />

        {isEditing ? (
          <div className="space-y-4">
            {/* Tabs for switching between details and communities */}
            <div className="flex border-b">
              <button
                className={`px-4 py-2 flex items-center gap-1.5 ${
                  activeTab === 'details' 
                    ? 'text-purple-600 border-b-2 border-purple-600 font-medium' 
                    : 'text-gray-500 hover:text-purple-500 transition-colors'
                }`}
                onClick={() => setActiveTab('details')}
              >
                <span className="text-lg">✏️</span>
                Group Details
              </button>
              <button
                className={`px-4 py-2 flex items-center gap-1.5 ${
                  activeTab === 'communities' 
                    ? 'text-purple-600 border-b-2 border-purple-600 font-medium' 
                    : 'text-gray-500 hover:text-purple-500 transition-colors'
                }`}
                onClick={() => setActiveTab('communities')}
              >
                <span className="text-lg">📚</span>
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
                isLoading={isLoadingAllCommunities || isLoadingGroupCommunities}
              />
            )}
          </div>
        ) : (
          <GroupViewModeContent 
            group={group}
            communities={communitiesForDisplay}
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
