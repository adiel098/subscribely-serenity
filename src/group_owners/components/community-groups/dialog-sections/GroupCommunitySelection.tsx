
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
  
  // Filter communities based on search query and ensure we only include non-group communities
  const filteredCommunities = allCommunities.filter(community => 
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) && !community.is_group
  );
  
  logger.log("Communities for selection:", {
    total: allCommunities.length,
    filtered: filteredCommunities.length,
    selected: selectedCommunityIds.length
  });
  
  // Handler for clearing all selected communities
  const handleClearSelection = useCallback(() => {
    selectedCommunityIds.forEach(id => toggleCommunity(id));
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
