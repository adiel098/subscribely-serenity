
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useCommunityContext } from "@/contexts/CommunityContext";

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
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`justify-between border-indigo-100 hover:border-indigo-300 shadow-sm bg-white hover:bg-gray-50 ${isMobile ? 'w-full' : 'min-w-[260px] max-w-[400px]'}`}
        >
          <span className="truncate community-dropdown-text mr-2 font-medium text-blue-700">
            {displayName}
          </span>
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
              <span className="truncate">{community.name}</span>
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
                  <span className="truncate">{group.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
