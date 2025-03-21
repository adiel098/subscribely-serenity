
import React from "react";
import { CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Community } from "@/telegram-mini-app/types/community.types";
import { formatCurrency } from "@/lib/utils";
import { useCardAnimations } from "./useCardAnimations";

interface CommunityCardHeaderProps {
  community: Community;
  isHovered: boolean;
}

export const CommunityCardHeader: React.FC<CommunityCardHeaderProps> = ({
  community,
  isHovered
}) => {
  const { name, telegram_photo_url, subscription_plans } = community;
  const { sparkleVariants } = useCardAnimations();
  
  const lowestPricePlan = subscription_plans && subscription_plans.length > 0
    ? [...subscription_plans].sort((a, b) => a.price - b.price)[0]
    : null;
  
  const avatarFallback = name ? name.charAt(0).toUpperCase() : "C";

  return (
    <CardHeader className="pb-2 relative">
      <motion.div 
        className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-100/80 to-transparent rounded-bl-3xl -z-0"
        animate={{
          opacity: isHovered ? 1 : 0.7,
          backgroundImage: isHovered 
            ? "linear-gradient(to bottom left, rgba(216, 180, 254, 0.6), transparent)" 
            : "linear-gradient(to bottom left, rgba(216, 180, 254, 0.3), transparent)"
        }}
        transition={{ duration: 0.5 }}
      />
      
      <div className="flex items-center gap-3 z-10">
        <motion.div className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
            {telegram_photo_url ? (
              <AvatarImage src={telegram_photo_url} alt={name} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-indigo-500 text-white text-lg font-medium">
                {avatarFallback}
              </AvatarFallback>
            )}
          </Avatar>
          
          <motion.span 
            className="absolute -top-1 -right-1 text-amber-400"
            variants={sparkleVariants}
            initial="initial"
            animate="animate"
          >
            <Sparkles className="h-4 w-4" />
          </motion.span>
        </motion.div>
        
        <div className="space-y-1">
          <motion.h3 
            className="font-semibold text-base bg-gradient-to-r from-purple-800 to-indigo-700 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {name}
          </motion.h3>
          
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {lowestPricePlan && (
              <Badge variant="outline" className="text-xs font-normal px-2 py-0 h-5 bg-gradient-to-r from-indigo-50 to-blue-50 border-blue-100 text-blue-700">
                From {formatCurrency(lowestPricePlan.price)}/{lowestPricePlan.interval === 'monthly' ? 'month' : lowestPricePlan.interval}
              </Badge>
            )}
          </motion.div>
        </div>
      </div>
    </CardHeader>
  );
};
