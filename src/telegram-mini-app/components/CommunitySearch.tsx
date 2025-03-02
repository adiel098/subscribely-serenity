
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { searchCommunities } from "../services/communityService";
import { Community } from "@/telegram-mini-app/types/community.types";
import { SearchBar } from "./search/SearchBar";
import { CommunityCard } from "./search/CommunityCard";
import { LoadingState } from "./search/LoadingState";
import { EmptyState } from "./search/EmptyState";

interface CommunitySearchProps {
  onSelectCommunity: (community: Community) => void;
}

export const CommunitySearch: React.FC<CommunitySearchProps> = ({ onSelectCommunity }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

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
      setIsLoading(true);
      try {
        const results = await searchCommunities(debouncedQuery);
        setCommunities(results);
      } catch (error) {
        console.error("Error searching communities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunities();
  }, [debouncedQuery]);

  return (
    <div className="w-full mx-0 overflow-hidden">
      <div className="space-y-5 w-full mx-0 px-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Discover Communities
          </h2>
          <p className="text-sm text-muted-foreground">Find and join communities that interest you</p>
        </div>
        
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        <div className="space-y-4 pt-2 w-full">
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
    </div>
  );
};
