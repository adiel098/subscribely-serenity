
import React from "react";
import { ChevronDown } from "lucide-react";
import { Community } from "@/group_owners/hooks/useCommunities";
import { CommunityAvatar } from "../photo-handling/CommunityAvatar";

interface CommunitySelectedDisplayProps {
  community: Community | undefined;
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
  if (!community) {
    return (
      <div className="flex items-center">
        <span className="text-gray-400 text-sm">Select community</span>
        <ChevronDown className="h-3 w-3 ml-1 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <CommunityAvatar
        community={community}
        photoUrl={photoUrl}
        isRefreshing={isRefreshing}
        onRefresh={onRefreshPhoto}
        size="sm"
      />
      <span className="font-medium text-gray-800 text-sm truncate">{community.name}</span>
      <ChevronDown className="h-3 w-3 ml-1 text-gray-400" />
    </div>
  );
};
