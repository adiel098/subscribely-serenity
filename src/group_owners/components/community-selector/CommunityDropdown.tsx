
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, RefreshCw } from "lucide-react";
import { Community } from "../../hooks/useCommunities";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CommunityDropdownProps {
  communities?: Community[];
  selectedCommunityId: string | null;
  setSelectedCommunityId: (id: string) => void;
}

export const CommunityDropdown = ({ 
  communities, 
  selectedCommunityId, 
  setSelectedCommunityId 
}: CommunityDropdownProps) => {
  const selectedCommunity = communities?.find(c => c.id === selectedCommunityId);
  const [refreshingCommunityId, setRefreshingCommunityId] = useState<string | null>(null);
  const [communityPhotos, setCommunityPhotos] = useState<Record<string, string>>({});
  const [isUpdatingAllPhotos, setIsUpdatingAllPhotos] = useState(false);
  
  // Initialize with existing photo URLs
  useEffect(() => {
    if (!communities?.length) return;
    
    const initialPhotos: Record<string, string> = {};
    communities.forEach(community => {
      if (community.id && community.telegram_photo_url) {
        initialPhotos[community.id] = community.telegram_photo_url;
      }
    });
    
    setCommunityPhotos(initialPhotos);
    
    // Fetch/update photos for all communities
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
      
      const response = await fetch('/check-community-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communities: telegramCommunities.map(c => ({
            id: c.id,
            telegram_chat_id: c.telegram_chat_id
          }))
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching community photos: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.results) {
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
  const handleRefreshPhoto = async (e: React.MouseEvent, communityId: string, chatId?: string | null) => {
    e.stopPropagation();
    
    if (!communityId || !chatId) {
      toast.error("Cannot refresh photo: missing community info");
      return;
    }
    
    try {
      setRefreshingCommunityId(communityId);
      
      const response = await fetch('/check-community-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communityId,
          telegramChatId: chatId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error refreshing photo: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.photoUrl) {
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

  const getPhotoUrl = (communityId: string) => {
    return communityPhotos[communityId] || undefined;
  };

  return (
    <div className="flex items-center gap-3 bg-white py-1 px-3 rounded-lg border shadow-sm">
      <div className="flex items-center gap-2">
        <div>
          <p className="text-xs text-gray-500 font-medium">COMMUNITY</p>
          <Select value={selectedCommunityId || undefined} onValueChange={setSelectedCommunityId}>
            <SelectTrigger className="w-[200px] border-none p-0 h-auto shadow-none focus:ring-0 focus:ring-offset-0">
              <div className="flex items-center gap-2">
                {selectedCommunity ? (
                  <>
                    <div className="relative">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={getPhotoUrl(selectedCommunity.id)} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                          {selectedCommunity.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gray-100 hover:bg-blue-100 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => handleRefreshPhoto(e, selectedCommunity.id, selectedCommunity.telegram_chat_id)}
                              disabled={refreshingCommunityId === selectedCommunity.id}
                            >
                              <RefreshCw className={`h-2 w-2 text-gray-500 ${refreshingCommunityId === selectedCommunity.id ? 'animate-spin' : ''}`} />
                              <span className="sr-only">Refresh photo</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p className="text-xs">Refresh community photo</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="font-medium text-gray-800 text-sm truncate">{selectedCommunity.name}</span>
                  </>
                ) : (
                  <span className="text-gray-400 text-sm">Select community</span>
                )}
                <ChevronDown className="h-3 w-3 ml-1 text-gray-400" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {communities?.map(community => (
                <SelectItem key={community.id} value={community.id || "community-fallback"}>
                  <div className="flex items-center gap-2 relative group">
                    <div className="relative">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={getPhotoUrl(community.id)} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                          {community.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gray-100 hover:bg-blue-100 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleRefreshPhoto(e, community.id, community.telegram_chat_id)}
                        disabled={refreshingCommunityId === community.id}
                      >
                        <RefreshCw className={`h-2 w-2 text-gray-500 ${refreshingCommunityId === community.id ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    <span className="text-sm truncate">{community.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
