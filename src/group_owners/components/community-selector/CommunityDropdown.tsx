
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, RefreshCw } from "lucide-react";
import { Community } from "../../hooks/useCommunities";
import { useState, useEffect } from "react";
import { useTelegramChatPhoto } from "@/telegram-mini-app/hooks/useTelegramChatPhoto";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const [refreshPhotoId, setRefreshPhotoId] = useState<string | null>(null);
  const [communityPhotos, setCommunityPhotos] = useState<Record<string, string>>({});
  
  // This hook handles the selected community photo refresh
  const { photoUrl, loading } = useTelegramChatPhoto({
    communityId: refreshPhotoId || selectedCommunityId,
    telegramChatId: selectedCommunity?.telegram_chat_id,
    existingPhotoUrl: selectedCommunity?.telegram_photo_url,
    forceFetch: refreshPhotoId === selectedCommunityId
  });
  
  // Update the photo map when the selected community photo is refreshed
  useEffect(() => {
    if (photoUrl && selectedCommunityId) {
      setCommunityPhotos(prev => ({
        ...prev,
        [selectedCommunityId]: photoUrl
      }));
    }
  }, [photoUrl, selectedCommunityId]);

  // Pre-load all community photos when communities change
  useEffect(() => {
    if (!communities) return;
    
    // Initialize with existing photo URLs
    const initialPhotos: Record<string, string> = {};
    communities.forEach(community => {
      if (community.id && community.telegram_photo_url) {
        initialPhotos[community.id] = community.telegram_photo_url;
      }
    });
    
    setCommunityPhotos(initialPhotos);
    
    // Fetch fresh photos for all communities asynchronously
    const fetchAllPhotos = async () => {
      for (const community of communities) {
        if (!community.id || !community.telegram_chat_id) continue;
        
        try {
          const response = await fetch('/check-community-photo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              communityId: community.id,
              telegramChatId: community.telegram_chat_id
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.photoUrl) {
              setCommunityPhotos(prev => ({
                ...prev,
                [community.id]: data.photoUrl
              }));
            }
          }
        } catch (error) {
          console.error(`Failed to fetch photo for community ${community.id}:`, error);
        }
      }
    };
    
    // Start fetching all photos in the background
    fetchAllPhotos();
  }, [communities]);
  
  const handleRefreshPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedCommunityId) {
      setRefreshPhotoId(selectedCommunityId);
    }
  };

  const getPhotoUrl = (communityId: string, defaultUrl?: string | null) => {
    return communityPhotos[communityId] || defaultUrl || undefined;
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
                        <AvatarImage src={photoUrl || getPhotoUrl(selectedCommunity.id, selectedCommunity.telegram_photo_url)} />
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
                              onClick={handleRefreshPhoto}
                            >
                              <RefreshCw className={`h-2 w-2 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
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
                  <div className="flex items-center gap-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={getPhotoUrl(community.id, community.telegram_photo_url)} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                        {community.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
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
