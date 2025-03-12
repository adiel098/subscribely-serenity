
import React from "react";
import { CommunityItem } from "./CommunityItem";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { Community } from "@/group_owners/hooks/useCommunities";

interface AddCommunitiesSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  availableCommunities: Community[];
  isLoadingCommunities: boolean;
  selectedCommunities: string[];
  toggleCommunity: (id: string) => void;
}

export const AddCommunitiesSection: React.FC<AddCommunitiesSectionProps> = ({
  searchQuery,
  setSearchQuery,
  availableCommunities,
  isLoadingCommunities,
  selectedCommunities,
  toggleCommunity
}) => {
  return (
    <div className="space-y-2 pt-2 border-t">
      <h3 className="text-sm font-medium">Add Communities</h3>
      
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search communities..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {isLoadingCommunities ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : availableCommunities.length === 0 ? (
        <p className="text-sm text-muted-foreground p-2">
          {searchQuery ? "No matching communities found" : "No more communities available"}
        </p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto p-1">
          {availableCommunities.map(community => (
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
