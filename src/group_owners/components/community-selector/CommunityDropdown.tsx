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
import { Community } from "@/group_owners/hooks/useCommunities";
import { CommunityAvatar } from "./photo-handling/CommunityAvatar";
import { useState } from "react";
import { getProxiedImageUrl } from "@/admin/services/imageProxyService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommunityDropdownProps {
  communities?: Community[] | null;
  groups?: any[] | null;
  selectedCommunityId: string | null;
  setSelectedCommunityId: (id: string) => void;
  selectedGroupId: string | null;
  setSelectedGroupId: (id: string | null) => void;
  isMobile?: boolean;
}

// Simple avatar component for consistency
const SimpleAvatar = ({ 
  name, 
  photoUrl, 
  className = "",
  size = "sm"
}: { 
  name: string; 
  photoUrl?: string | null; 
  className?: string;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClass = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-10 w-10"
  };
  
  return (
    <Avatar className={`${sizeClass[size]} ${className}`}>
      {photoUrl && (
        <AvatarImage 
          src={photoUrl} 
          alt={name}
        />
      )}
      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
        {name?.charAt(0)?.toUpperCase() || '?'}
      </AvatarFallback>
    </Avatar>
  );
};

export const CommunityDropdown: React.FC<CommunityDropdownProps> = ({ 
  communities, 
  groups,
  selectedCommunityId,
  setSelectedCommunityId,
  selectedGroupId,
  setSelectedGroupId,
  isMobile = false
}) => {
  const { isGroupSelected } = useCommunityContext();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Handle the community selection
  const handleSelectCommunity = (communityId: string) => {
    setSelectedCommunityId(communityId);
    setSelectedGroupId(null);
  };
  
  // Handle the group selection
  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
  };
  
  // Find the selected community or group to display in the trigger
  const selectedCommunity = communities?.find(c => c.id === selectedCommunityId);
  const selectedGroup = groups?.find(g => g.id === selectedGroupId);
  
  // The display name for the trigger
  const displayName = isGroupSelected 
    ? selectedGroup?.name || "בחר קבוצה" 
    : selectedCommunity?.name || "בחר קהילה";

  // Process photo URL to ensure it's properly loaded
  const selectedPhotoUrl = isGroupSelected
    ? selectedGroup?.telegram_photo_url 
      ? getProxiedImageUrl(selectedGroup.telegram_photo_url)
      : null
    : selectedCommunity?.telegram_photo_url 
      ? getProxiedImageUrl(selectedCommunity.telegram_photo_url)
      : null;
  
  const handleRefreshPhoto = (e: React.MouseEvent, communityId: string, chatId?: string | null) => {
    e.stopPropagation();
    setIsRefreshing(true);
    // כאן יש להוסיף לוגיקה לרענון תמונה אם צריך
    setTimeout(() => setIsRefreshing(false), 1000);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`justify-between border-indigo-100 hover:border-indigo-300 shadow-sm bg-white hover:bg-gray-50 ${isMobile ? 'w-full h-6 text-[11px]' : 'min-w-[200px] max-w-[260px] h-8 text-xs'}`}
          size="sm"
        >
          <div className="flex items-center gap-1">
            {isGroupSelected ? (
              selectedGroup?.telegram_photo_url ? (
                <SimpleAvatar 
                  name={selectedGroup.name}
                  photoUrl={selectedPhotoUrl}
                  size={isMobile ? "sm" : "md"}
                />
              ) : (
                <div className="flex items-center justify-center h-5 w-5 rounded-md bg-indigo-100 text-indigo-600">
                  <Users className="h-3 w-3" />
                </div>
              )
            ) : (
              <CommunityAvatar
                community={selectedCommunity || { id: '', name: 'קהילה'} as Community}
                photoUrl={selectedPhotoUrl || undefined}
                isRefreshing={isRefreshing}
                onRefresh={handleRefreshPhoto}
                size={isMobile ? "sm" : "md"}
                showRefreshButton={false}
              />
            )}
            {!isMobile ? (
              <span className="truncate community-dropdown-text mr-2 font-medium text-blue-700 max-w-[180px]">
                {displayName}
              </span>
            ) : (
              <span className="truncate community-dropdown-text mr-1 font-medium text-blue-700 max-w-[60px] text-[8px]">
                {displayName.length > 8 ? `${displayName.substring(0, 8)}...` : displayName}
              </span>
            )}
          </div>
          <ChevronDown className={`${isMobile ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} opacity-50`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 bg-white/95 backdrop-blur-sm border-blue-100 shadow-xl">
        <DropdownMenuLabel className="text-xs">Your Communities</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {communities?.filter(community => !community.is_group).map((community) => (
            <DropdownMenuItem 
              key={community.id} 
              className={`cursor-pointer text-xs ${selectedCommunityId === community.id && !isGroupSelected ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}
              onClick={() => handleSelectCommunity(community.id)}
            >
              <div className="flex items-center gap-2 w-full">
                <CommunityAvatar
                  community={community}
                  photoUrl={community.telegram_photo_url || undefined}
                  isRefreshing={isRefreshing}
                  onRefresh={handleRefreshPhoto}
                  size="sm"
                  showRefreshButton={false}
                />
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
                    {group.telegram_photo_url ? (
                      <SimpleAvatar 
                        name={group.name}
                        photoUrl={group.telegram_photo_url}
                        size="sm"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-5 w-5 rounded-md bg-indigo-100 text-indigo-600">
                        <Users className="h-3 w-3" />
                      </div>
                    )}
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
