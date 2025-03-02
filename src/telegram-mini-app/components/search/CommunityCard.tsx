
import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, ChevronRight } from "lucide-react";
import { Community } from "@/telegram-mini-app/types/community.types";

interface CommunityCardProps {
  community: Community;
  onSelect: (community: Community) => void;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({ community, onSelect }) => {
  const { name, description, telegram_photo_url, subscription_plans, member_count } = community;
  
  // Get the lowest price plan if available
  const lowestPricePlan = subscription_plans && subscription_plans.length > 0
    ? [...subscription_plans].sort((a, b) => a.price - b.price)[0]
    : null;
  
  // Prepare avatar fallback (first letter of community name)
  const avatarFallback = name ? name.charAt(0).toUpperCase() : "C";
  
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect(community)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border">
            {telegram_photo_url ? (
              <AvatarImage src={telegram_photo_url} alt={name} />
            ) : (
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <h3 className="font-medium">{name}</h3>
            {lowestPricePlan && (
              <Badge variant="outline" className="text-xs font-normal">
                From ${lowestPricePlan.price}/{lowestPricePlan.interval}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description || "Join this community to access exclusive content and connect with members."}
        </p>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between items-center">
        <div className="flex items-center text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5 mr-1" />
          <span>{member_count || 0} members</span>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </CardFooter>
    </Card>
  );
};
