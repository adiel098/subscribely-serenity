
import React from "react";
import { SelectItem } from "@/components/ui/select";
import { Community } from "@/group_owners/hooks/useCommunities";
import { CommunityAvatar } from "../photo-handling/CommunityAvatar";

interface CommunitySelectItemProps {
  community: Community;
  photoUrl?: string;
  isRefreshing: boolean;
  onRefreshPhoto: (e: React.MouseEvent, communityId: string, chatId?: string | null) => void;
  value: string;
}

export const CommunitySelectItem: React.FC<CommunitySelectItemProps> = ({
  community,
  photoUrl,
  isRefreshing,
  onRefreshPhoto,
  value
}) => {
  return (
    <SelectItem key={community.id} value={value} className="focus:bg-slate-100">
      <div className="flex items-center gap-2 relative group">
        <CommunityAvatar
          community={community}
          photoUrl={photoUrl}
          isRefreshing={isRefreshing}
          onRefresh={onRefreshPhoto}
          size="md"
          showRefreshButton={false}
        />
        <span className="text-sm truncate">{community.name}</span>
      </div>
    </SelectItem>
  );
};
