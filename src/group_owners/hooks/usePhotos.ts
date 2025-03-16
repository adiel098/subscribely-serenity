
import { useCommunityPhotos } from "@/group_owners/components/community-selector/photo-handling/useCommunityPhotos";
import { useCommunities } from "./useCommunities";

export const usePhotos = () => {
  const { data: communities } = useCommunities();
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
