
import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, Crown, Star, Sparkles } from "lucide-react";
import { Community } from "@/telegram-mini-app/types/community.types";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

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
      console.log("🔍 Selected community:", name);
      
      // Provide haptic feedback if available
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
      
      // Select this community in the parent component
      onSelect(community);
      
      // Show toast notification
      toast({
        title: "Community selected",
        description: `Viewing subscription options for ${name}`,
      });
      
    } catch (error) {
      console.error("❌ Error selecting community:", error);
      toast({
        title: "Error",
        description: "Failed to select this community. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Default description text if none is available
  const defaultDescription = "Join this community to access exclusive content and connect with members. ✨";
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Card 
        className="overflow-hidden border-purple-100 hover:border-purple-200 bg-gradient-to-tr from-white to-purple-50 dark:from-gray-900 dark:to-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer w-full" 
        onClick={() => onSelect(community)}
      >
        <CardHeader className="pb-2 relative">
          {/* Decorative gradient corner accent */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-100/80 to-transparent rounded-bl-3xl -z-0" />
          
          <div className="flex items-center gap-3 z-10">
            <div className="relative">
              <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                {telegram_photo_url ? (
                  <AvatarImage src={telegram_photo_url} alt={name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-indigo-500 text-white text-lg font-medium">
                    {avatarFallback}
                  </AvatarFallback>
                )}
              </Avatar>
              
              {/* Decorative corner sparkle */}
              <span className="absolute -top-1 -right-1 text-amber-400">
                <Sparkles className="h-4 w-4" />
              </span>
            </div>
            
            <div className="space-y-1">
              <h3 className="font-semibold text-base bg-gradient-to-r from-purple-800 to-indigo-700 bg-clip-text text-transparent">{name}</h3>
              
              <div className="flex items-center space-x-2">
                {lowestPricePlan && (
                  <Badge variant="outline" className="text-xs font-normal px-2 py-0 h-5 bg-gradient-to-r from-indigo-50 to-blue-50 border-blue-100 text-blue-700">
                    From {formatCurrency(lowestPricePlan.price)}/{lowestPricePlan.interval === 'month' ? 'month' : lowestPricePlan.interval}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {description || defaultDescription}
          </p>
        </CardContent>
        
        <CardFooter className="pt-2 flex justify-between items-center">
          <Button 
            size="sm" 
            onClick={handleSubscribe}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm"
          >
            <Star className="mr-2 h-4 w-4" />
            Subscribe Now ✨
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
