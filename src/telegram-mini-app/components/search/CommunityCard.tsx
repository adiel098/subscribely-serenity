
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Community } from "@/telegram-mini-app/types/community.types";
import { motion } from "framer-motion";
import { useCardAnimations } from "./card-components/useCardAnimations";
import { CommunityCardHeader } from "./card-components/CommunityCardHeader";
import { CommunityCardContent } from "./card-components/CommunityCardContent";
import { CommunityCardFooter } from "./card-components/CommunityCardFooter";
import { useToast } from "@/hooks/use-toast";

interface CommunityCardProps {
  community: Community;
  onSelect: (community: Community) => void;
  animationDelay?: number;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({ 
  community, 
  onSelect,
  animationDelay = 0
}) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const { cardVariants } = useCardAnimations(animationDelay);
  
  const handleSubscribe = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      console.log("🔍 Selected community:", community.name);
      
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
      
      onSelect(community);
      
      toast({
        title: "Community selected",
        description: `Viewing subscription options for ${community.name}`,
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
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
    
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };
  
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="w-full"
    >
      <Card 
        className="overflow-hidden border-purple-100 hover:border-purple-200 bg-gradient-to-tr from-white to-purple-50 dark:from-gray-900 dark:to-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer w-full" 
        onClick={() => onSelect(community)}
      >
        <CommunityCardHeader 
          community={community} 
          isHovered={isHovered} 
        />
        
        <CommunityCardContent 
          community={community}
          isExpanded={isExpanded}
          toggleExpand={toggleExpand}
        />
        
        <CommunityCardFooter 
          onSubscribe={handleSubscribe} 
        />
      </Card>
    </motion.div>
  );
};
