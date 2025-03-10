
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Community } from "../../hooks/useCommunities";
import { useCommunityPhotos } from "./photo-handling/useCommunityPhotos";
import { CommunitySelectItem } from "./dropdown-items/CommunitySelectItem";
import { CommunitySelectedDisplay } from "./dropdown-items/CommunitySelectedDisplay";
import { AlertCircle, RefreshCw } from "lucide-react";
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
  
  const {
    refreshingCommunityId,
    isUpdatingAllPhotos,
    lastError,
    handleRefreshPhoto,
    getPhotoUrl,
    retryFetchAllPhotos
  } = useCommunityPhotos(communities);

  return (
    <div className="flex items-center gap-3 bg-white py-1 px-3 rounded-lg border shadow-sm">
      <div className="flex items-center gap-2">
        <div className="relative">
          <p className="text-xs text-gray-500 font-medium">COMMUNITY</p>
          <Select value={selectedCommunityId || undefined} onValueChange={setSelectedCommunityId}>
            <SelectTrigger className="w-[200px] border-none p-0 h-auto shadow-none focus:ring-0 focus:ring-offset-0">
              <CommunitySelectedDisplay
                community={selectedCommunity}
                photoUrl={selectedCommunity ? getPhotoUrl(selectedCommunity.id) : undefined}
                isRefreshing={selectedCommunity?.id === refreshingCommunityId}
                onRefreshPhoto={handleRefreshPhoto}
              />
            </SelectTrigger>
            <SelectContent>
              {communities?.map(community => (
                <CommunitySelectItem
                  key={community.id}
                  community={community}
                  photoUrl={getPhotoUrl(community.id)}
                  isRefreshing={community.id === refreshingCommunityId}
                  onRefreshPhoto={handleRefreshPhoto}
                />
              ))}
            </SelectContent>
          </Select>
          
          {isUpdatingAllPhotos && (
            <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <RefreshCw className="w-3 h-3 text-blue-500 animate-spin" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="text-xs">Loading community photos...</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
          
          {lastError && (
            <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-4 h-4 p-0" 
                      onClick={retryFetchAllPhotos}
                    >
                      <AlertCircle className="w-3 h-3 text-red-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-[220px]">
                    <p className="text-xs">Error loading photos. Click to retry.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
