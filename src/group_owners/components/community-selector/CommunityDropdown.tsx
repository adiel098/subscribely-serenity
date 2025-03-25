
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
          className={`justify-between border-indigo-100 hover:border-indigo-300 shadow-sm bg-white hover:bg-gray-50 ${isMobile ? 'w-full' : 'min-w-[260px] max-w-[400px]'}`}
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 border border-indigo-100">
              {selectedPhotoUrl ? (
                <AvatarImage 
                  src={selectedPhotoUrl} 
                  alt={displayName}
                />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
                  {displayName?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="truncate community-dropdown-text mr-2 font-medium text-blue-700">
              {displayName}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 bg-white/95 backdrop-blur-sm border-blue-100 shadow-xl">
        <DropdownMenuLabel>Your Communities</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {communities?.map((community) => (
            <DropdownMenuItem 
              key={community.id} 
              className={`cursor-pointer ${selectedCommunityId === community.id && !isGroupSelected ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}
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
            <DropdownMenuLabel>Your Groups</DropdownMenuLabel>
            <DropdownMenuGroup>
              {groups.map((group) => (
                <DropdownMenuItem 
                  key={group.id} 
                  className={`cursor-pointer ${selectedGroupId === group.id ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}
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
