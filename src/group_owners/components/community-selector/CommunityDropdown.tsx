
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Community } from "../../hooks/useCommunities";
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";
import { useCommunityPhotos } from "./photo-handling/useCommunityPhotos";
import { CommunitySelectItem } from "./dropdown-items/CommunitySelectItem";
import { CommunitySelectedDisplay } from "./dropdown-items/CommunitySelectedDisplay";
import { GroupSelectItem } from "./dropdown-items/GroupSelectItem";
import { GroupSelectedDisplay } from "./dropdown-items/GroupSelectedDisplay";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface CommunityDropdownProps {
  communities?: Community[];
  groups?: CommunityGroup[];
  selectedCommunityId: string | null;
  selectedGroupId: string | null;
  setSelectedCommunityId: (id: string) => void;
  setSelectedGroupId: (id: string) => void;
}

export const CommunityDropdown = ({ 
  communities, 
  groups,
  selectedCommunityId, 
  selectedGroupId,
  setSelectedCommunityId,
  setSelectedGroupId
}: CommunityDropdownProps) => {
  const selectedCommunity = communities?.find(c => c.id === selectedCommunityId);
  const selectedGroup = groups?.find(g => g.id === selectedGroupId);
  
  const {
    refreshingCommunityId,
    isUpdatingAllPhotos,
    lastError,
    handleRefreshPhoto,
    getPhotoUrl,
    retryFetchAllPhotos
  } = useCommunityPhotos(communities);

  const handleSelectChange = (value: string) => {
    // Check if the selected value is a community or a group
    if (value.startsWith("community-")) {
      const communityId = value.replace("community-", "");
      setSelectedCommunityId(communityId);
    } else if (value.startsWith("group-")) {
      const groupId = value.replace("group-", "");
      setSelectedGroupId(groupId);
    }
  };

  // Current selected value
  const selectedValue = selectedCommunityId 
    ? `community-${selectedCommunityId}` 
    : selectedGroupId 
      ? `group-${selectedGroupId}` 
      : undefined;

  return (
    <div className="flex items-center gap-3 bg-white py-1 px-3 rounded-lg border shadow-sm">
      <div className="flex items-center gap-2">
        <div className="relative">
          <p className="text-xs text-gray-500 font-medium">COMMUNITY</p>
          <Select value={selectedValue} onValueChange={handleSelectChange}>
            <SelectTrigger className="w-[220px] border-none p-0 h-auto shadow-none focus:ring-0 focus:ring-offset-0">
              {selectedCommunityId ? (
                <CommunitySelectedDisplay
                  community={selectedCommunity}
                  photoUrl={selectedCommunity ? getPhotoUrl(selectedCommunity.id) : undefined}
                  isRefreshing={selectedCommunity?.id === refreshingCommunityId}
                  onRefreshPhoto={handleRefreshPhoto}
                />
              ) : selectedGroupId ? (
                <GroupSelectedDisplay
                  group={selectedGroup}
                />
              ) : (
                <div className="flex items-center">
                  <span className="text-gray-400 text-sm">Select community</span>
                </div>
              )}
            </SelectTrigger>
            <SelectContent>
              {/* Display communities */}
              {communities?.map(community => (
                <CommunitySelectItem
                  key={`community-${community.id}`}
                  value={`community-${community.id}`}
                  community={community}
                  photoUrl={getPhotoUrl(community.id)}
                  isRefreshing={community.id === refreshingCommunityId}
                  onRefreshPhoto={handleRefreshPhoto}
                />
              ))}
              
              {/* Add separator if we have both communities and groups */}
              {communities?.length && groups?.length ? (
                <Separator className="my-2" />
              ) : null}
              
              {/* Display groups */}
              {groups?.map(group => (
                <GroupSelectItem
                  key={`group-${group.id}`}
                  value={`group-${group.id}`}
                  group={group}
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
