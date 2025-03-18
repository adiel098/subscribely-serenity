
import React, { memo } from "react";
import { Community } from "@/group_owners/hooks/useCommunities";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Users } from "lucide-react";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("CommunityList");

interface CommunityListProps {
  communities: Community[];
  selectedCommunityIds: string[];
  toggleCommunity: (id: string) => void;
}

export const CommunityList: React.FC<CommunityListProps> = memo(({
  communities,
  selectedCommunityIds,
  toggleCommunity
}) => {
  // Log the received props
  logger.debug("CommunityList props:", {
    communities,
    isArray: Array.isArray(communities),
    communitiesLength: communities?.length,
    selectedCount: selectedCommunityIds?.length,
    isSelectedArray: Array.isArray(selectedCommunityIds)
  });
  
  // Ensure communities is an array
  const communitiesArray = Array.isArray(communities) ? communities : [];
  
  if (communitiesArray.length === 0) {
    logger.log("Communities array is empty");
    return <div className="p-4 text-center text-gray-500">No communities available.</div>;
  }

  logger.log("Rendering community list with:", { 
    communitiesCount: communitiesArray.length, 
    selectedCount: selectedCommunityIds.length 
  });

  return (
    <div className="rounded-md border border-gray-200 divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
      {communitiesArray.map((community) => {
        if (!community || typeof community !== 'object' || !community.id) {
          logger.error("Invalid community object:", community);
          return null;
        }
        
        return (
          <CommunityItem
            key={community.id}
            community={community}
            isSelected={selectedCommunityIds.includes(community.id)}
            onToggle={() => toggleCommunity(community.id)}
          />
        );
      })}
    </div>
  );
});

interface CommunityItemProps {
  community: Community;
  isSelected: boolean;
  onToggle: () => void;
}

// Separate memoized component for each item to prevent re-renders of all items
const CommunityItem = memo(({ community, isSelected, onToggle }: CommunityItemProps) => {
  if (!community || typeof community !== 'object') {
    logger.error("Invalid community in CommunityItem:", community);
    return null;
  }

  return (
    <div 
      className={`flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-purple-50' : ''
      }`}
    >
      <Checkbox
        id={`community-${community.id}`}
        checked={isSelected}
        onCheckedChange={onToggle}
        className={isSelected ? 'text-purple-600' : ''}
      />
      <div className="flex-shrink-0 h-9 w-9 bg-gray-100 rounded-md overflow-hidden">
        {community.telegram_photo_url ? (
          <img src={community.telegram_photo_url} alt={community.name} className="h-full w-full object-cover" />
        ) : (
          <Users className="h-5 w-5 text-gray-400 m-2" />
        )}
      </div>
      <label htmlFor={`community-${community.id}`} className="flex items-center gap-2 flex-1 cursor-pointer">
        <div>
          <p className="text-sm font-medium text-gray-700">{community.name}</p>
          {community.description && (
            <p className="text-xs text-gray-500 truncate max-w-xs">{community.description}</p>
          )}
        </div>
        {isSelected && (
          <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
        )}
      </label>
    </div>
  );
});

CommunityItem.displayName = "CommunityItem";
CommunityList.displayName = "CommunityList";
