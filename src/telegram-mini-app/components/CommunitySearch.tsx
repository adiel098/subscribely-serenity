
import React, { useState, useEffect } from "react";
import { Search, Users, Star, ArrowRight, Sparkles } from "lucide-react";
import { searchCommunities } from "../services/memberService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Community {
  id: string;
  name: string;
  description: string | null;
  telegram_photo_url: string | null;
  telegram_invite_link: string | null;
  member_count: number;
  subscription_plans: Array<{
    id: string;
    name: string;
    price: number;
    interval: string;
  }>;
}

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

  // Helper to get cheapest plan price
  const getCheapestPlanPrice = (community: Community) => {
    if (!community.subscription_plans || community.subscription_plans.length === 0) {
      return null;
    }
    
    const sortedPlans = [...community.subscription_plans].sort((a, b) => a.price - b.price);
    return sortedPlans[0];
  };

  // Card component for each community
  const CommunityCard = ({ community }: { community: Community }) => {
    const cheapestPlan = getCheapestPlanPrice(community);
    
    return (
      <Card className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer group" onClick={() => onSelectCommunity(community)}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              {community.telegram_photo_url ? (
                <img 
                  src={community.telegram_photo_url} 
                  alt={community.name} 
                  className="h-12 w-12 rounded-full object-cover border-2 border-primary/10"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              )}
              <div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {community.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {community.member_count} members
                </CardDescription>
              </div>
            </div>
            {community.subscription_plans && community.subscription_plans.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-primary/5 gap-1">
                <Sparkles className="h-3 w-3 text-primary" />
                {community.subscription_plans.length} {community.subscription_plans.length === 1 ? "plan" : "plans"}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          {community.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {community.description}
            </p>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between items-center pt-2">
          <div className="text-sm text-muted-foreground flex items-center">
            {cheapestPlan ? (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                From ${cheapestPlan.price}/{cheapestPlan.interval}
              </span>
            ) : (
              <span className="text-muted-foreground/70">No subscription plans</span>
            )}
          </div>
          
          <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Discover Communities
        </h2>
        <p className="text-sm text-muted-foreground">Find and join communities that interest you</p>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for communities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-background border-primary/20 focus:border-primary"
        />
      </div>
      
      <div className="space-y-4 pt-2">
        {isLoading ? (
          // Loading skeletons
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="h-4 w-full my-1" />
                <Skeleton className="h-4 w-4/5" />
              </CardContent>
              <CardFooter className="pt-2 flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardFooter>
            </Card>
          ))
        ) : communities.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <Search className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium">No communities found</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {searchQuery 
                ? `No communities matching "${searchQuery}". Try a different search term.` 
                : "Try searching for communities by name or browse our featured communities."}
            </p>
          </div>
        ) : (
          communities.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))
        )}
      </div>
    </div>
  );
};
