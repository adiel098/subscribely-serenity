
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Community } from "@/group_owners/hooks/useCommunities";

type CommunityPhotoMap = Record<string, string>;

export const useCommunityPhotos = (communities?: Community[]) => {
  const [communityPhotos, setCommunityPhotos] = useState<CommunityPhotoMap>({});
  const [refreshingCommunityId, setRefreshingCommunityId] = useState<string | null>(null);
  const [isUpdatingAllPhotos, setIsUpdatingAllPhotos] = useState(false);

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
      
      // Filter communities with Telegram chat IDs
      const telegramCommunities = communitiesList.filter(c => c.id && c.telegram_chat_id);
      
      if (telegramCommunities.length === 0) {
        console.log("No communities with Telegram chat IDs found");
        return;
      }
      
      console.log(`Fetching photos for ${telegramCommunities.length} communities`);
      
      // Use Supabase Edge Function to fetch all photos
      const { data, error } = await supabase.functions.invoke("get-telegram-chat-photo", {
        body: {
          communities: telegramCommunities.map(c => ({
            id: c.id,
            telegramChatId: c.telegram_chat_id
          }))
        }
      });
      
      if (error) {
        throw new Error(`Error fetching community photos: ${error.message}`);
      }
      
      if (data?.results) {
        setCommunityPhotos(prev => ({
          ...prev,
          ...data.results
        }));
        console.log("Updated photos for all communities", data.results);
      }
    } catch (error) {
      console.error("Failed to fetch community photos:", error);
      toast.error("Failed to update community photos");
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
      toast.error("Failed to update community photo");
    } finally {
      setRefreshingCommunityId(null);
    }
  };

  // Function to get the correct photo URL for a community
  const getPhotoUrl = (communityId: string) => {
    return communityPhotos[communityId] || undefined;
  };

  return {
    communityPhotos,
    refreshingCommunityId,
    isUpdatingAllPhotos,
    handleRefreshPhoto,
    getPhotoUrl
  };
};
