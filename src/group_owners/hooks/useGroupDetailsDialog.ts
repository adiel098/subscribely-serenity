
import { useState, useEffect } from "react";
import { CommunityGroup } from "./types/communityGroup.types";
import { Community } from "./useCommunities";
import { useUpdateCommunityGroup } from "./useUpdateCommunityGroup";
import { useGroupMemberCommunities } from "./useGroupMemberCommunities";
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
  
  // Fetch member communities for the current group
  const { 
    communities: groupCommunities, 
    isLoading: isLoadingGroupCommunities, 
    communityIds: fetchedCommunityIds,
    error: groupCommunitiesError
  } = useGroupMemberCommunities(group.id);
  
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
      
      logger.log("Dialog opened for group:", group.id);
    }
  }, [group, isEditModeByDefault, hasInitialized]);
  
  // Set selected communities when we have data - with safeguards against infinite loops
  useEffect(() => {
    if (!hasInitialized) return;
    
    if (fetchedCommunityIds.length > 0) {
      logger.log("Setting selected communities from fetchedCommunityIds:", fetchedCommunityIds);
      setSelectedCommunityIds(fetchedCommunityIds);
    } else if (communities && communities.length > 0) {
      logger.log("Setting selected communities from props:", communities.map(c => c.id));
      setSelectedCommunityIds(communities.map(c => c.id));
    } else {
      // Only log once, not in an infinite loop
      logger.log("No communities found for selection");
    }
  }, [hasInitialized, fetchedCommunityIds, communities]);
  
  // Fix: Debug output to track what's happening with communities
  useEffect(() => {
    if (groupCommunitiesError) {
      logger.error("Error fetching group communities:", groupCommunitiesError);
    }
    
    logger.log("Group communities state:", {
      groupId: group.id,
      communitiesFromProps: communities?.length || 0,
      communitiesFromHook: groupCommunities?.length || 0,
      fetchedIds: fetchedCommunityIds.length,
      selectedIds: selectedCommunityIds.length,
      loadingStatus: isLoadingGroupCommunities
    });
  }, [group.id, communities, groupCommunities, fetchedCommunityIds, selectedCommunityIds, isLoadingGroupCommunities, groupCommunitiesError]);
  
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
    groupCommunities: groupCommunities || [],
    isLoadingAllCommunities,
    isLoadingGroupCommunities,
    isPendingUpdate: updateGroupMutation.isPending,
    setIsEditing,
    setName,
    setDescription,
    setPhotoUrl,
    setCustomLink,
    setActiveTab,
    handleSaveChanges,
    toggleCommunity,
    resetDialogState
  };
}
