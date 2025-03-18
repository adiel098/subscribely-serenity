
import React, { useState, memo, useCallback } from "react";
import { Community } from "@/group_owners/hooks/useCommunities";
import { SectionHeader } from "./community-selection/SectionHeader";
import { SearchBar } from "./community-selection/SearchBar";
import { LoadingState } from "./community-selection/LoadingState";
import { CommunityList } from "./community-selection/CommunityList";
import { EmptyState } from "./community-selection/EmptyState";
import { SelectedCounter } from "./community-selection/SelectedCounter";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("GroupCommunitySelection");

interface GroupCommunitySelectionProps {
  allCommunities: Community[];
  selectedCommunityIds: string[];
  toggleCommunity: (id: string) => void;
  isLoading: boolean;
}

export const GroupCommunitySelection: React.FC<GroupCommunitySelectionProps> = memo(({
  allCommunities,
  selectedCommunityIds,
  toggleCommunity,
  isLoading
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ensure we always have an array for communities
  const communitiesArray = Array.isArray(allCommunities) ? allCommunities : [];
  
  logger.log("Communities for selection:", {
    total: communitiesArray.length,
    selected: selectedCommunityIds.length,
    selectedIds: selectedCommunityIds
  });
  
  // Filter communities based on search query and ensure we only include non-group communities
  const filteredCommunities = communitiesArray.filter(community => 
    community && 
    typeof community === 'object' &&
    community.name && 
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
    !community.is_group
  );
  
  // Handler for clearing all selected communities
  const handleClearSelection = useCallback(() => {
    if (selectedCommunityIds.length > 0) {
      selectedCommunityIds.forEach(id => toggleCommunity(id));
    }
  }, [selectedCommunityIds, toggleCommunity]);
  
  return (
    <div className="space-y-4">
      <SectionHeader />
      
      {/* Search input */}
      <SearchBar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />
      
      {/* Community selection list */}
      {isLoading ? (
        <LoadingState />
      ) : filteredCommunities.length > 0 ? (
        <CommunityList 
          communities={filteredCommunities}
          selectedCommunityIds={selectedCommunityIds}
          toggleCommunity={toggleCommunity}
        />
      ) : (
        <EmptyState searchQuery={searchQuery} />
      )}
      
      {/* Selected communities counter */}
      <SelectedCounter 
        selectedCount={selectedCommunityIds.length}
        onClearSelection={handleClearSelection}
      />
    </div>
  );
});

GroupCommunitySelection.displayName = "GroupCommunitySelection";
