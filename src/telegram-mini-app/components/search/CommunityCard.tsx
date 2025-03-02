
import React from "react";
import { Users, Star, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Community } from "@/telegram-mini-app/types/community.types";

interface CommunityCardProps {
  community: Community;
  onSelect: (community: Community) => void;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({ community, onSelect }) => {
  // Helper to get cheapest plan price
  const getCheapestPlanPrice = (community: Community) => {
    if (!community.subscription_plans || community.subscription_plans.length === 0) {
      return null;
    }
    
    const sortedPlans = [...community.subscription_plans].sort((a, b) => a.price - b.price);
    return sortedPlans[0];
  };
  
  const cheapestPlan = getCheapestPlanPrice(community);
  
  return (
    <Card className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer group" onClick={() => onSelect(community)}>
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
