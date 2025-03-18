
import React from "react";
import { Community } from "@/group_owners/hooks/useCommunities";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Users } from "lucide-react";

interface CommunityListProps {
  communities: Community[];
  selectedCommunityIds: string[];
  toggleCommunity: (id: string) => void;
}

export const CommunityList: React.FC<CommunityListProps> = ({
  communities,
  selectedCommunityIds,
  toggleCommunity
}) => {
  return (
    <div className="rounded-md border border-gray-200 divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
      {communities.map(community => (
        <div 
          key={community.id}
          className={`flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
            selectedCommunityIds.includes(community.id) ? 'bg-purple-50' : ''
          }`}
        >
          <Checkbox
            id={`community-${community.id}`}
            checked={selectedCommunityIds.includes(community.id)}
            onCheckedChange={() => toggleCommunity(community.id)}
            className={selectedCommunityIds.includes(community.id) ? 'text-purple-600' : ''}
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
            {selectedCommunityIds.includes(community.id) && (
              <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
            )}
          </label>
        </div>
      ))}
    </div>
  );
};
