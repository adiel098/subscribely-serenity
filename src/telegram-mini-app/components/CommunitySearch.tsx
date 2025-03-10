
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { searchCommunities } from "../services/communityService";
import { Community } from "@/telegram-mini-app/types/community.types";
import { SearchBar } from "./search/SearchBar";
import { CommunityCard } from "./search/CommunityCard";
import { LoadingState } from "./search/LoadingState";
import { EmptyState } from "./search/EmptyState";
import { useCommunitiesWithDescriptions } from "../hooks/useCommunitiesWithDescriptions";

interface CommunitySearchProps {
  onSelectCommunity: (community: Community) => void;
}

export const CommunitySearch: React.FC<CommunitySearchProps> = ({ onSelectCommunity }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [rawCommunities, setRawCommunities] = useState<Community[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  
  // Use our custom hook to enhance communities with descriptions
  const { communities, loading: isLoadingDescriptions } = useCommunitiesWithDescriptions(rawCommunities);
  
  // Combine the loading states
  const isLoading = isSearching || isLoadingDescriptions;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search communities when debounced query changes
  useEffect(() => {
    const fetchCommunities = async () => {
      setIsSearching(true);
      try {
        const results = await searchCommunities(debouncedQuery);
        setRawCommunities(results);
      } catch (error) {
        console.error("Error searching communities:", error);
      } finally {
        setIsSearching(false);
      }
    };

    fetchCommunities();
  }, [debouncedQuery]);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Discover Communities
        </h2>
        <p className="text-sm text-muted-foreground">Find and join communities that interest you</p>
      </div>
      
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      <div className="space-y-4 pt-2">
        {isLoading ? (
          <LoadingState />
        ) : communities.length === 0 ? (
          <EmptyState searchQuery={searchQuery} />
        ) : (
          communities.map((community) => (
            <CommunityCard 
              key={community.id} 
              community={community} 
              onSelect={onSelectCommunity} 
            />
          ))
        )}
      </div>
    </div>
  );
};
