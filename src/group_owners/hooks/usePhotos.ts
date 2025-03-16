
import { useCommunityPhotos } from "../components/community-selector/photo-handling/useCommunityPhotos";
import { useCommunities } from "./useCommunities";

export const usePhotos = () => {
  const { data: communities } = useCommunities();
  
  const {
    communityPhotos,
    refreshingCommunityId,
    isUpdatingAllPhotos,
    lastError,
    handleRefreshPhoto,
    getPhotoUrl,
    retryFetchAllPhotos
  } = useCommunityPhotos(communities);
  
  const isRefreshing = !!refreshingCommunityId || isUpdatingAllPhotos;
  
  // We'll maintain the same interface for backwards compatibility
  const refreshPhoto = handleRefreshPhoto;
  
  return {
    communityPhotos,
    isRefreshing,
    refreshingCommunityId,
    isUpdatingAllPhotos,
    lastError,
    refreshPhoto,
    getPhotoUrl,
    retryFetchAllPhotos
  };
};
