import { useCommunityPhotos } from "@/group_owners/components/community-selector/photo-handling/useCommunityPhotos";
import { useProjectCommunities } from "./useProjectCommunities";
import { useProjectContext } from "@/contexts/ProjectContext";

export const usePhotos = () => {
  const { selectedProjectId } = useProjectContext();
  const { data: communities } = useProjectCommunities(selectedProjectId);
  
  const { 
    communityPhotos, 
    refreshingCommunityId, 
    isUpdatingAllPhotos,
    lastError,
    lastUpdate,
    handleRefreshPhoto,
    getPhotoUrl,
    retryFetchAllPhotos
  } = useCommunityPhotos(communities);

  return {
    communityPhotos,
    getPhotoUrl,
    refreshPhoto: handleRefreshPhoto,
    isRefreshing: !!refreshingCommunityId || isUpdatingAllPhotos,
    refreshingCommunityId,
    lastError,
    lastUpdate,
    retryFetchAllPhotos
  };
};
