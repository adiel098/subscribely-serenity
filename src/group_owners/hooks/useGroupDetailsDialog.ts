
import { useState, useEffect, useCallback, useRef } from "react";
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
      setHasInitialized(true);
      
      logger.log("Dialog initialized for group:", group.id);
    }
  }, [group, isEditModeByDefault, hasInitialized]);
  
  const handleSaveChanges = useCallback(() => {
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
  }, [
    name, description, photoUrl, customLink, 
    selectedCommunityIds, group.id, 
    updateGroupMutation, onGroupUpdated, onClose
  ]);

  // Safely update selected community IDs using a stable function with proper equality check
  const setSelectedCommunitiesArray = useCallback((ids: string[]) => {
    setSelectedCommunityIds(prevIds => {
      // Use JSON.stringify for deep comparison of arrays to prevent infinite loops
      const currentIdsJson = JSON.stringify([...prevIds].sort());
      const newIdsJson = JSON.stringify([...ids].sort());
      
      if (currentIdsJson !== newIdsJson) {
        logger.log("Updating selected communities:", ids);
        return ids;
      }
      return prevIds;
    });
  }, []);

  // Toggle community selection with memoized function to prevent re-renders
  const toggleCommunity = useCallback((communityId: string) => {
    logger.log("Toggling community:", communityId);
    setSelectedCommunityIds(prev => {
      // Check if the community is already in the array
      if (prev.includes(communityId)) {
        // If it is, create a new array without it
        return prev.filter(id => id !== communityId);
      } else {
        // If it's not, add it to the array
        return [...prev, communityId];
      }
    });
  }, []);

  // Reset dialog state with a memoized function
  const resetDialogState = useCallback(() => {
    logger.log("Resetting dialog state");
    setHasInitialized(false);
    setSelectedCommunityIds([]);
  }, []);

  return {
    isEditing,
    name,
    description,
    photoUrl,
    customLink,
    selectedCommunityIds,
    allCommunities,
    isLoadingAllCommunities,
    isPendingUpdate: updateGroupMutation.isPending,
    setIsEditing,
    setName,
    setDescription,
    setPhotoUrl,
    setCustomLink,
    setSelectedCommunityIds: setSelectedCommunitiesArray,
    handleSaveChanges,
    toggleCommunity,
    resetDialogState
  };
}
