
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
  
  return {
    communityPhotos,
    isRefreshing,
    refreshingCommunityId,
    isUpdatingAllPhotos,
    lastError,
    refreshPhoto: handleRefreshPhoto,
    getPhotoUrl,
    retryFetchAllPhotos
  };
};
