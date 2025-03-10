
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Community } from "@/group_owners/hooks/useCommunities";

type CommunityPhotoMap = Record<string, string>;

export const useCommunityPhotos = (communities?: Community[]) => {
  const [communityPhotos, setCommunityPhotos] = useState<CommunityPhotoMap>({});
  const [refreshingCommunityId, setRefreshingCommunityId] = useState<string | null>(null);
  const [isUpdatingAllPhotos, setIsUpdatingAllPhotos] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

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
      
      // Use check-community-photo edge function for batch processing
      const { data, error } = await supabase.functions.invoke("check-community-photo", {
        body: {
          communities: communitiesData
        }
      });
      
      if (error) {
        console.error("Error fetching community photos:", error);
        setLastError(`Failed to fetch photos: ${error.message}`);
        return;
      }
      
      // Update photo URLs if we received results
      if (data?.results && Object.keys(data.results).length > 0) {
        console.log("Received photo results:", data.results);
        setCommunityPhotos(prev => ({
          ...prev,
          ...data.results
        }));
      } else {
        console.log("No photo results returned");
      }
    } catch (error) {
      console.error("Failed to fetch community photos:", error);
      setLastError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsUpdatingAllPhotos(false);
    }
  };

  // Function to refresh a single community photo
  const handleRefreshPhoto = async (
    e: React.MouseEvent, 
    communityId: string, 
    chatId?: string | null
  ) => {
    e.stopPropagation();
    
    if (!communityId || !chatId) {
      toast.error("Cannot refresh photo: missing community info");
      return;
    }
    
    try {
      setRefreshingCommunityId(communityId);
      setLastError(null);
      
      const { data, error } = await supabase.functions.invoke("get-telegram-chat-photo", {
        body: {
          communityId,
          telegramChatId: chatId,
          forceFetch: true
        }
      });
      
      if (error) {
        throw new Error(`Error refreshing photo: ${error.message}`);
      }
      
      if (data?.photoUrl) {
        setCommunityPhotos(prev => ({
          ...prev,
          [communityId]: data.photoUrl
        }));
        toast.success("Community photo updated");
      } else {
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
    return communityPhotos[communityId] || undefined;
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
    handleRefreshPhoto,
    getPhotoUrl,
    retryFetchAllPhotos
  };
};
