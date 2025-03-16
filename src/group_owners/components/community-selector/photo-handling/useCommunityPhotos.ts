
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Community } from "@/group_owners/hooks/useCommunities";
import { invokeSupabaseFunction } from "@/telegram-mini-app/services/utils/serviceUtils";
import { getProxiedImageUrl } from "@/admin/services/imageProxyService";

type CommunityPhotoMap = Record<string, string>;

export const useCommunityPhotos = (communities?: Community[]) => {
  const [communityPhotos, setCommunityPhotos] = useState<CommunityPhotoMap>({});
  const [refreshingCommunityId, setRefreshingCommunityId] = useState<string | null>(null);
  const [isUpdatingAllPhotos, setIsUpdatingAllPhotos] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Initialize with existing photo URLs
  useEffect(() => {
    if (!communities?.length) return;
    
    const initialPhotos: CommunityPhotoMap = {};
    communities.forEach(community => {
      if (community.id && community.telegram_photo_url) {
        initialPhotos[community.id] = community.telegram_photo_url;
      }
    });
    
    setCommunityPhotos(initialPhotos);
    
    // Fetch/update photos for all communities when component mounts
    fetchAllCommunityPhotos(communities);
  }, [communities]);

  // Function to fetch photos for all communities
  const fetchAllCommunityPhotos = async (communitiesList: Community[]) => {
    if (!communitiesList?.length) return;
    
    try {
      setIsUpdatingAllPhotos(true);
      setLastError(null);
      
      // Filter communities with Telegram chat IDs
      const telegramCommunities = communitiesList.filter(c => c.id && c.telegram_chat_id);
      
      if (telegramCommunities.length === 0) {
        console.log("No communities with Telegram chat IDs found");
        return;
      }
      
      console.log(`Fetching photos for ${telegramCommunities.length} communities`);
      
      // Prepare community data for the bulk request
      const communitiesData = telegramCommunities.map(c => ({
        id: c.id,
        telegramChatId: c.telegram_chat_id
      }));
      
      // Use the utility function for better logging and error handling
      const { data, error } = await invokeSupabaseFunction("check-community-photo", {
        communities: communitiesData
      });
      
      if (error) {
        console.error("Error fetching community photos:", error);
        setLastError(`Failed to fetch photos: ${error.message}`);
        toast.error("Failed to load community photos");
        return;
      }
      
      console.log("Full response from check-community-photo:", data);
      
      // Update photo URLs if we received results
      if (data?.results && Object.keys(data.results).length > 0) {
        console.log("Received photo results:", data.results);
        setCommunityPhotos(prev => {
          const updatedPhotos = {
            ...prev,
            ...data.results
          };
          console.log("Updated photo map:", updatedPhotos);
          return updatedPhotos;
        });
        
        // Force a refresh to ensure UI updates
        setLastUpdate(Date.now());
        
        // Show success toast only if we got at least some photos
        if (Object.keys(data.results).length > 0) {
          toast.success(`Loaded ${Object.keys(data.results).length} community photos`);
        }
      } else {
        console.log("No photo results returned");
        if (data?.message) {
          console.log("Response message:", data.message);
        }
        if (data?.errors && data.errors.length > 0) {
          console.error("Errors returned:", data.errors);
          setLastError(`Errors loading photos: ${data.errors[0].error}`);
        }
        
        if (telegramCommunities.length > 0 && !data?.errors) {
          toast.info("No community photos available");
        }
      }
    } catch (error) {
      console.error("Failed to fetch community photos:", error);
      setLastError(error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to load community photos");
    } finally {
      setIsUpdatingAllPhotos(false);
    }
  };

  // Function to refresh a single community photo
  const handleRefreshPhoto = async (communityId: string, chatId?: string | null) => {
    if (!communityId || !chatId) {
      toast.error("Cannot refresh photo: missing community info");
      return;
    }
    
    try {
      setRefreshingCommunityId(communityId);
      setLastError(null);
      
      console.log(`Refreshing photo for community ${communityId} with chat ID ${chatId}`);
      
      const { data, error } = await invokeSupabaseFunction("check-community-photo", {
        communityId,
        telegramChatId: chatId,
        forceFetch: true
      });
      
      if (error) {
        console.error("Error refreshing photo:", error);
        throw new Error(`Error refreshing photo: ${error.message}`);
      }
      
      console.log("Photo refresh response:", data);
      
      if (data?.photoUrl) {
        // Update the photo URL
        setCommunityPhotos(prev => {
          const updated = {
            ...prev,
            [communityId]: data.photoUrl
          };
          console.log("Updated single photo. New photo map:", updated);
          return updated;
        });
        
        // Force a refresh of components that use this hook
        setLastUpdate(Date.now());
        
        toast.success("Community photo updated");
      } else {
        if (data?.error) {
          throw new Error(data.error);
        }
        toast.info("No photo available for this community");
      }
    } catch (error) {
      console.error("Failed to refresh community photo:", error);
      setLastError(error instanceof Error ? error.message : "Unknown error");
      toast.error("Failed to update community photo");
    } finally {
      setRefreshingCommunityId(null);
    }
  };

  // Function to get the correct photo URL for a community
  const getPhotoUrl = (communityId: string) => {
    const photoUrl = communityPhotos[communityId] || undefined;
    console.log(`Getting photo URL for community ${communityId}:`, photoUrl);
    return photoUrl; 
  };

  // Function to retry after a failed batch fetch
  const retryFetchAllPhotos = () => {
    if (communities?.length) {
      fetchAllCommunityPhotos(communities);
    }
  };

  return {
    communityPhotos,
    refreshingCommunityId,
    isUpdatingAllPhotos,
    lastError,
    lastUpdate,
    handleRefreshPhoto,
    getPhotoUrl,
    retryFetchAllPhotos
  };
};
