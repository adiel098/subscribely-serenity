
import { useState, useEffect } from "react";
import { CommunityGroup } from "./types/communityGroup.types";
import { Community } from "./useCommunities";
import { useUpdateCommunityGroup } from "./useUpdateCommunityGroup";
import { useCommunities } from "./useCommunities";
import { toast } from "sonner";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useGroupDetailsDialog");

export function useGroupDetailsDialog(
  group: CommunityGroup,
  communities: Community[],
  onGroupUpdated: () => void,
  onClose: () => void,
  isEditModeByDefault = true
) {
  const [isEditing, setIsEditing] = useState(isEditModeByDefault);
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || "");
  const [photoUrl, setPhotoUrl] = useState(group.telegram_photo_url || "");
  const [customLink, setCustomLink] = useState(group.custom_link || "");
  const [selectedCommunityIds, setSelectedCommunityIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'communities'>('details');
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Get all communities for selection
  const { data: allCommunities, isLoading: isLoadingAllCommunities } = useCommunities();
  
  const updateGroupMutation = useUpdateCommunityGroup();
  
  // Initialize form state when dialog opens or group changes - only once
  useEffect(() => {
    if (!hasInitialized) {
      setIsEditing(isEditModeByDefault);
      setName(group.name);
      setDescription(group.description || "");
      setPhotoUrl(group.telegram_photo_url || "");
      setCustomLink(group.custom_link || "");
      setActiveTab('details');
      setHasInitialized(true);
      
      // We don't set selectedCommunityIds here anymore as we'll get this from useGroupChannels
      logger.log("Dialog opened for group:", group.id);
    }
  }, [group, isEditModeByDefault, hasInitialized]);
  
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

  const resetDialogState = () => {
    setHasInitialized(false);
  };

  return {
    isEditing,
    name,
    description,
    photoUrl,
    customLink,
    selectedCommunityIds,
    activeTab,
    allCommunities,
    isLoadingAllCommunities,
    isPendingUpdate: updateGroupMutation.isPending,
    setIsEditing,
    setName,
    setDescription,
    setPhotoUrl,
    setCustomLink,
    setSelectedCommunityIds,
    setActiveTab,
    handleSaveChanges,
    toggleCommunity,
    resetDialogState
  };
}
