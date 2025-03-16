
import React from "react";
import { ChevronDown } from "lucide-react";
import { Community } from "@/group_owners/hooks/useCommunities";
import { CommunityAvatar } from "../photo-handling/CommunityAvatar";

interface CommunitySelectedDisplayProps {
  community: Community;
  photoUrl?: string;
  isRefreshing: boolean;
  onRefreshPhoto: (e: React.MouseEvent, communityId: string, chatId?: string | null) => void;
}

export const CommunitySelectedDisplay: React.FC<CommunitySelectedDisplayProps> = ({
  community,
  photoUrl,
  isRefreshing,
  onRefreshPhoto
}) => {
  return (
    <div className="flex items-center gap-2 w-full">
      <CommunityAvatar
        community={community}
        photoUrl={photoUrl}
        isRefreshing={isRefreshing}
        onRefresh={onRefreshPhoto}
        size="sm"
      />
      <span className="font-medium text-gray-800 text-xs truncate flex-1">{community.name}</span>
      <ChevronDown className="h-3 w-3 text-gray-400 flex-shrink-0 ml-auto" />
    </div>
  );
};
