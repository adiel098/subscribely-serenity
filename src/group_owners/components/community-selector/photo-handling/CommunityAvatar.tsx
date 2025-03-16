
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Community } from "@/group_owners/hooks/useCommunities";
import { getProxiedImageUrl } from "@/admin/services/imageProxyService";

interface CommunityAvatarProps {
  community: Community;
  photoUrl?: string;
  isRefreshing: boolean;
  onRefresh: (e: React.MouseEvent, communityId: string, chatId?: string | null) => void;
  size?: "sm" | "md" | "lg";
  showRefreshButton?: boolean;
}

export const CommunityAvatar: React.FC<CommunityAvatarProps> = ({
  community,
  photoUrl,
  isRefreshing,
  onRefresh,
  size = "sm",
  showRefreshButton = true
}) => {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-10 w-10"
  };

  const refreshButtonSizeClasses = {
    sm: "h-3 w-3 rounded-full p-0.5",
    md: "h-4 w-4 rounded-full p-0.5",
    lg: "h-5 w-5 rounded-full p-0.5"
  };

  const refreshIconSizeClasses = {
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3"
  };

  // Process the photo URL to ensure it's properly loaded
  const processedPhotoUrl = getProxiedImageUrl(photoUrl);
  
  // Log photo URL for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`Avatar for ${community.name}:`, {
      original: photoUrl,
      processed: processedPhotoUrl
    });
  }

  return (
    <div className="relative group">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage 
          src={processedPhotoUrl || undefined} 
          alt={community.name}
          onError={(e) => {
            console.error(`Failed to load image for ${community.name}:`, e);
            // Force fallback by removing the src attribute
            (e.target as HTMLImageElement).src = '';
          }}
        />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs">
          {community.name?.charAt(0)?.toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>
      
      {showRefreshButton && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                className={`absolute -top-1 -right-1 bg-gray-100 hover:bg-blue-100 opacity-0 group-hover:opacity-100 transition-opacity ${refreshButtonSizeClasses[size]}`}
                onClick={(e) => onRefresh(e, community.id, community.telegram_chat_id)}
                disabled={isRefreshing}
              >
                <RefreshCw className={`text-gray-500 ${refreshIconSizeClasses[size]} ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="sr-only">Refresh photo</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs">Refresh community photo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
