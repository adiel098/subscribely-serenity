
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePhotos = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  const getPhotoUrl = (communityId: string): string | undefined => {
    return photoUrls[communityId];
  };

  const refreshPhoto = async (
    communityId: string, 
    chatId?: string | null
  ) => {
    if (!communityId || !chatId) {
      console.log("Cannot refresh photo: missing community info");
      return;
    }

    try {
      setIsRefreshing(true);
      
      // Call the Supabase function to refresh the community photo
      const { data, error } = await supabase.functions.invoke("check-community-photo", {
        body: {
          communityId,
          telegramChatId: chatId,
          forceFetch: true
        }
      });
      
      if (error) {
        console.error("Error refreshing photo:", error);
        toast.error("Failed to refresh community photo");
        return;
      }
      
      if (data?.photoUrl) {
        setPhotoUrls(prev => ({
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
      setIsRefreshing(false);
    }
  };

  return { getPhotoUrl, refreshPhoto, isRefreshing };
};
