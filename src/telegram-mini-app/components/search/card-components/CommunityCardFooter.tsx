
import React from "react";
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { useCardAnimations } from "./useCardAnimations";

interface CommunityCardFooterProps {
  onSubscribe: (e: React.MouseEvent) => void;
}

export const CommunityCardFooter: React.FC<CommunityCardFooterProps> = ({
  onSubscribe
}) => {
  const { buttonVariants } = useCardAnimations();

  return (
    <CardFooter className="pt-2 flex justify-between items-center">
      <motion.div 
        className="w-full"
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
      >
        <Button 
          size="sm" 
          onClick={onSubscribe}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm"
        >
          <Star className="mr-2 h-4 w-4" />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Subscribe Now <motion.span 
              animate={{ 
                opacity: [1, 0.5, 1],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse" as const
              }}
            >✨</motion.span>
          </motion.span>
        </Button>
      </motion.div>
    </CardFooter>
  );
};
