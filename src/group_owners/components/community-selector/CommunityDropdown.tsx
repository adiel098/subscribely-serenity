
import { ChevronDown, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getProxiedImageUrl } from "@/admin/services/imageProxyService";

export const CommunityDropdown = ({ 
  communities, 
  groups,
  selectedCommunityId,
  setSelectedCommunityId,
  selectedGroupId,
  setSelectedGroupId,
  isMobile = false
}) => {
  const { isGroupSelected } = useCommunityContext();
  
  // Handle the community selection
  const handleSelectCommunity = (communityId) => {
    setSelectedCommunityId(communityId);
    setSelectedGroupId(null);
  };
  
  // Handle the group selection
  const handleSelectGroup = (groupId) => {
    setSelectedGroupId(groupId);
  };
  
  // Find the selected community or group to display in the trigger
  const selectedCommunity = communities?.find(c => c.id === selectedCommunityId);
  const selectedGroup = groups?.find(g => g.id === selectedGroupId);
  
  // The display name for the trigger
  const displayName = isGroupSelected 
    ? selectedGroup?.name || "Select a group" 
    : selectedCommunity?.name || "Select a community";

  // Process photo URL to ensure it's properly loaded
  const selectedPhotoUrl = isGroupSelected
    ? null // Groups don't have photos currently
    : selectedCommunity?.telegram_photo_url 
      ? getProxiedImageUrl(selectedCommunity.telegram_photo_url)
      : null;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`justify-between border-indigo-100 hover:border-indigo-300 shadow-sm bg-white hover:bg-gray-50 h-8 ${isMobile ? 'w-full text-xs' : 'min-w-[200px] max-w-[260px] text-xs'}`}
          size="sm"
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5 border border-indigo-100">
              {selectedPhotoUrl ? (
                <AvatarImage 
                  src={selectedPhotoUrl} 
                  alt={displayName}
                />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-[10px]">
                  {displayName?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              )}
            </Avatar>
            {!isMobile ? (
              <span className="truncate community-dropdown-text mr-2 font-medium text-blue-700 max-w-[180px]">
                {displayName}
              </span>
            ) : (
              <span className="truncate community-dropdown-text mr-2 font-medium text-blue-700 max-w-[120px]">
                {displayName.length > 15 ? `${displayName.substring(0, 15)}...` : displayName}
              </span>
            )}
          </div>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 bg-white/95 backdrop-blur-sm border-blue-100 shadow-xl">
        <DropdownMenuLabel className="text-xs">Your Communities</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {communities?.map((community) => (
            <DropdownMenuItem 
              key={community.id} 
              className={`cursor-pointer text-xs ${selectedCommunityId === community.id && !isGroupSelected ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}
              onClick={() => handleSelectCommunity(community.id)}
            >
              <div className="flex items-center gap-2 w-full">
                <Avatar className="h-5 w-5 border border-gray-100">
                  {community.telegram_photo_url ? (
                    <AvatarImage 
                      src={getProxiedImageUrl(community.telegram_photo_url)} 
                      alt={community.name}
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-[10px]">
                      {community.name?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="truncate">{community.name}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        {groups && groups.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs">Your Groups</DropdownMenuLabel>
            <DropdownMenuGroup>
              {groups.map((group) => (
                <DropdownMenuItem 
                  key={group.id} 
                  className={`cursor-pointer text-xs ${selectedGroupId === group.id ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}
                  onClick={() => handleSelectGroup(group.id)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex items-center justify-center h-5 w-5 rounded-md bg-indigo-100 text-indigo-600">
                      <Users className="h-3 w-3" />
                    </div>
                    <span className="truncate">{group.name}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
