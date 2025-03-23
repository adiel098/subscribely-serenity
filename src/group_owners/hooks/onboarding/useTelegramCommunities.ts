
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

export function useTelegramCommunities(userId: string | undefined) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingPhoto, setIsRefreshingPhoto] = useState(false);
  const [communities, setCommunities] = useState<any[]>([]);
  const [connectedCommunities, setConnectedCommunities] = useState<any[]>([]);
  const [lastConnectedCommunity, setLastConnectedCommunity] = useState<any>(null);

  const fetchConnectedCommunities = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('communities')
        .select('id, name, telegram_chat_id, telegram_photo_url')
        .eq('owner_id', userId)
        .eq('is_group', false)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching communities:', error);
        setIsLoading(false);
        return;
      }
      
      if (data && data.length > 0) {
        // Set the last connected community
        setLastConnectedCommunity(data[0]);
        
        // Set all connected communities
        setConnectedCommunities(data);
        setCommunities(data);
      } else {
        // If no communities found, reset states
        setLastConnectedCommunity(null);
        setConnectedCommunities([]);
        setCommunities([]);
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching communities:', err);
      setIsLoading(false);
    }
  }, [userId]);

  const refreshCommunities = useCallback(() => {
    return fetchConnectedCommunities();
  }, [fetchConnectedCommunities]);

  const getCommunityById = useCallback((id: string) => {
    return communities.find(comm => comm.id === id) || null;
  }, [communities]);

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

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchConnectedCommunities();
    } else {
      setIsLoading(false);
    }
  }, [userId, fetchConnectedCommunities]);

  return {
    isLoading,
    communities,
    connectedCommunities,
    lastConnectedCommunity,
    isRefreshingPhoto,
    refreshCommunities,
    fetchConnectedCommunities,
    getCommunityById,
    handleRefreshPhoto
  };
}
