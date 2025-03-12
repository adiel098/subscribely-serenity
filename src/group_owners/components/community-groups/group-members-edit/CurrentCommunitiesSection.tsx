
import React from "react";
import { CommunityItem } from "./CommunityItem";
import { Community } from "@/group_owners/hooks/useCommunities";

interface CurrentCommunitiesSectionProps {
  communities: Community[];
  selectedCommunities: string[];
  toggleCommunity: (id: string) => void;
}

export const CurrentCommunitiesSection: React.FC<CurrentCommunitiesSectionProps> = ({
  communities,
  selectedCommunities,
  toggleCommunity
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Current Communities</h3>
      
      {communities.length === 0 ? (
        <p className="text-sm text-muted-foreground">No communities in this group yet.</p>
      ) : (
        <div className="space-y-2 max-h-40 overflow-y-auto p-1">
          {communities.map(community => (
            <CommunityItem
              key={community.id}
              community={community}
              isSelected={selectedCommunities.includes(community.id)}
              onToggle={toggleCommunity}
            />
          ))}
        </div>
      )}
    </div>
  );
};
