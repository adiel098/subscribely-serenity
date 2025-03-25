
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const HeaderActions = ({ onNewCommunityClick, isMobile = false }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button 
        className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 gap-2 ${isMobile ? 'px-3 text-xs py-1 h-8' : ''}`}
        onClick={onNewCommunityClick}
        size={isMobile ? "sm" : "default"}
      >
        <PlusCircle className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
        {isMobile ? 'Community' : 'New Community'}
      </Button>
    </motion.div>
  );
};
