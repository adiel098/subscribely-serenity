
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, RefreshCw } from "lucide-react";
import { Community } from "../../hooks/useCommunities";
import { useState } from "react";
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
  
  const { photoUrl, loading } = useTelegramChatPhoto({
    communityId: refreshPhotoId || selectedCommunityId,
    telegramChatId: selectedCommunity?.telegram_chat_id,
    existingPhotoUrl: selectedCommunity?.telegram_photo_url,
    forceFetch: refreshPhotoId === selectedCommunityId
  });
  
  const handleRefreshPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedCommunityId) {
      setRefreshPhotoId(selectedCommunityId);
    }
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
                        <AvatarImage src={photoUrl || selectedCommunity.telegram_photo_url || undefined} />
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
                      <AvatarImage src={community.telegram_photo_url || undefined} />
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
