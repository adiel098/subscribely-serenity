
import React from "react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Community } from "@/telegram-mini-app/types/community.types";

interface CommunityCardContentProps {
  community: Community;
  isExpanded: boolean;
  toggleExpand: (e: React.MouseEvent) => void;
}

export const CommunityCardContent: React.FC<CommunityCardContentProps> = ({
  community,
  isExpanded,
  toggleExpand
}) => {
  const { description } = community;
  const descriptionText = description || "";
  const isLongDescription = descriptionText.length > 100;
  const shortDescription = isLongDescription ? `${descriptionText.substring(0, 100)}...` : descriptionText;
  
  if (!descriptionText) {
    return <CardContent className="pb-2"></CardContent>;
  }

  return (
    <CardContent className="pb-2">
      <motion.div 
        className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-lg p-2 border border-indigo-100/30"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-xs text-indigo-700/80 italic font-medium">
          {isExpanded ? descriptionText : shortDescription}
          
          {isLongDescription && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleExpand}
                className="px-2 py-0 h-5 ml-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 text-xs"
              >
                {isExpanded ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center"
                  >
                    Read less <ChevronDown className="ml-1 h-3 w-3" />
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center"
                  >
                    Read more <ChevronRight className="ml-1 h-3 w-3" />
                  </motion.div>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </CardContent>
  );
};
