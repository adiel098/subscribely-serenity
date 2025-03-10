
import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Community } from "@/telegram-mini-app/types/community.types";
import { useToast } from "@/hooks/use-toast";

interface CommunityCardProps {
  community: Community;
  onSelect: (community: Community) => void;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({ community, onSelect }) => {
  const { name, description, telegram_photo_url, subscription_plans, custom_link } = community;
  const { toast } = useToast();
  
  // Get the lowest price plan if available
  const lowestPricePlan = subscription_plans && subscription_plans.length > 0
    ? [...subscription_plans].sort((a, b) => a.price - b.price)[0]
    : null;
  
  // Prepare avatar fallback (first letter of community name)
  const avatarFallback = name ? name.charAt(0).toUpperCase() : "C";
  
  const handleSubscribe = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    
    try {
      // If we have a custom link, use it, otherwise use the community ID
      const startParam = custom_link || community.id;
      
      // Check if Telegram WebApp is available
      if (window.Telegram?.WebApp?.openTelegramLink) {
        // Construct the mini app URL with the start parameter
        const miniAppUrl = `https://t.me/YourBotUsername/app?startapp=${startParam}`;
        
        console.log("🔗 Opening Telegram mini app:", miniAppUrl);
        window.Telegram.WebApp.openTelegramLink(miniAppUrl);
      } else {
        console.error("❌ Telegram WebApp not available");
        toast({
          title: "Cannot open mini app",
          description: "The Telegram WebApp API is not available",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("❌ Error opening mini app:", error);
      toast({
        title: "Error",
        description: "Failed to open the community page",
        variant: "destructive"
      });
    }
  };
  
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
        <Button 
          size="sm" 
          onClick={handleSubscribe}
          className="w-full"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Subscribe
        </Button>
      </CardFooter>
    </Card>
  );
};
