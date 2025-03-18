
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
  const { communities: groupCommunities, isLoading: isLoadingGroupCommunities, communityIds: fetchedCommunityIds } = useGroupMemberCommunities(group.id);
  
  const updateGroupMutation = useUpdateCommunityGroup();
  
  // Reset form state when dialog opens or group changes
  useEffect(() => {
    if (isOpen) {
      setIsEditing(isEditModeByDefault);
      setName(group.name);
      setDescription(group.description || "");
      setPhotoUrl(group.telegram_photo_url || "");
      setCustomLink(group.custom_link || "");
      setActiveTab('details');
      
      logger.log("Dialog opened for group:", group.id);
      
      // Set selected communities immediately if we have fetched data
      if (fetchedCommunityIds.length > 0) {
        logger.log("Setting selected communities from fetchedCommunityIds:", fetchedCommunityIds);
        setSelectedCommunityIds(fetchedCommunityIds);
      } else if (communities && communities.length > 0) {
        logger.log("Setting selected communities from props:", communities.map(c => c.id));
        setSelectedCommunityIds(communities.map(c => c.id));
      } else {
        logger.log("No communities found for selection");
        setSelectedCommunityIds([]);
      }
    }
  }, [isOpen, group.id, group.name, group.description, group.telegram_photo_url, group.custom_link, communities, isEditModeByDefault, fetchedCommunityIds]);
  
  // Update selected communities when groupCommunities change
  useEffect(() => {
    if (isOpen && groupCommunities && groupCommunities.length > 0) {
      const communityIds = groupCommunities.map(c => c.id);
      logger.log("Updating selected communities from groupCommunities:", communityIds);
      setSelectedCommunityIds(communityIds);
    }
  }, [isOpen, groupCommunities]);
  
  const handleSaveChanges = () => {
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }
    
    logger.log("Saving group with communities:", selectedCommunityIds);
    
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
          toast.error(`Failed to update group details: ${error.message}`);
        }
      }
    );
  };

  // Toggle community selection
  const toggleCommunity = (communityId: string) => {
    logger.log("Toggling community:", communityId);
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
                allCommunities={allCommunities?.filter(c => !c.is_group) || []}
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
