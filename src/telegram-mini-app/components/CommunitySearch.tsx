import React, { useState, useEffect } from "react";
import { Search, Users2 } from "lucide-react";
import { searchCommunities } from "../services/communityService";
import { Community } from "@/telegram-mini-app/types/community.types";
import { SearchBar } from "./search/SearchBar";
import { CommunityCard } from "./search/CommunityCard";
import { LoadingState } from "./search/LoadingState";
import { EmptyState } from "./search/EmptyState";
import { SearchPageHeader } from "./search/SearchPageHeader";
import { useCommunitiesWithDescriptions } from "../hooks/useCommunitiesWithDescriptions";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle
} from "@/components/ui/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface CommunitySearchProps {
  onSelectCommunity: (community: Community) => void;
}

export const CommunitySearch: React.FC<CommunitySearchProps> = ({ onSelectCommunity }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [rawCommunities, setRawCommunities] = useState<Community[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  
  // Use our custom hook to enhance communities with descriptions
  const { communities: allCommunities, loading: isLoadingDescriptions } = useCommunitiesWithDescriptions(rawCommunities);
  
  // Combine the loading states
  const isLoading = isSearching || isLoadingDescriptions;

  // Apply price filter
  const communities = priceRange 
    ? allCommunities.filter(community => {
        // Find the minimum price plan of the community
        const minPrice = community.subscription_plans.reduce((min, plan) => {
          const price = plan.price || 0;
          return price < min ? price : min;
        }, Number.MAX_SAFE_INTEGER);
        
        // If there are no plans, show it in all price ranges
        if (minPrice === Number.MAX_SAFE_INTEGER) return true;
        
        // Check if the price is within the selected range
        return minPrice >= priceRange[0] && minPrice <= priceRange[1];
      })
    : allCommunities;

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

  // Animation variants for container and items
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <div className="space-y-3 min-h-[calc(100vh-100px)]">
      {/* Enhanced header with more animations */}
      <SearchPageHeader />
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
          >
            <Search className="h-5 w-5 text-primary" />
          </motion.div>
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Discover Communities
          </motion.span>
        </h2>
        <motion.p 
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          Find and join communities that interest you
        </motion.p>
      </motion.div>
      
      <SearchBar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        priceRange={priceRange}
        setPriceRange={setPriceRange}
      />
      
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingState key="loading" />
        ) : communities.length === 0 ? (
          <EmptyState key="empty" searchQuery={searchQuery} />
        ) : (
          <motion.div 
            key="results"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3 mb-16 px-2"
          >
            {communities.map((community, index) => (
              <Card key={community.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    {community.telegram_photo_url ? (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={community.telegram_photo_url} alt={community.name} />
                        <AvatarFallback>{community.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Users2 className="h-4 w-4" />
                      </div>
                    )}
                    <CardTitle className="text-base">{community.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {community.description || "No description available"}
                  </p>
                  <div className="flex justify-between items-center">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onSelectCommunity(community)}
                    >
                      Join
                    </Button>
                    {community.subscription_plans?.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        From {formatCurrency(
                          community.subscription_plans.reduce((min, plan) => {
                            return Math.min(min, plan.price);
                          }, Infinity)
                        )}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
