
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function useTelegramCommunities(userId: string | undefined) {
  const [isRefreshingPhoto, setIsRefreshingPhoto] = useState(false);
  const [connectedCommunities, setConnectedCommunities] = useState<any[]>([]);
  const [lastConnectedCommunity, setLastConnectedCommunity] = useState<any>(null);

  const fetchConnectedCommunities = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('id, name, telegram_chat_id, telegram_photo_url')
        .eq('owner_id', userId)
        .eq('is_group', false)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching communities:', error);
        return;
      }
      
      if (data && data.length > 0) {
        // Set the last connected community
        setLastConnectedCommunity(data[0]);
        
        // Set all connected communities
        setConnectedCommunities(data);
      }
    } catch (err) {
      console.error('Error fetching communities:', err);
    }
  };

  const handleRefreshPhoto = (e: React.MouseEvent, communityId: string, chatId?: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsRefreshingPhoto(true);
    
    // Call the function to refresh the photo
    supabase.functions.invoke('check-community-photo', {
      body: { communityId, forceRefresh: true }
    }).then(() => {
      fetchConnectedCommunities();
      setIsRefreshingPhoto(false);
    }).catch(err => {
      console.error('Error refreshing photo:', err);
      setIsRefreshingPhoto(false);
    });
  };

  return {
    connectedCommunities,
    lastConnectedCommunity,
    isRefreshingPhoto,
    fetchConnectedCommunities,
    handleRefreshPhoto
  };
}
