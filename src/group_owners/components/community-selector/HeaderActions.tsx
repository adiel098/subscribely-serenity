
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface HeaderActionsProps {
  onNewCommunityClick: () => void;
}

export const HeaderActions = ({ onNewCommunityClick }: HeaderActionsProps) => {
  return (
    <div className="flex items-center gap-4 ml-auto">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          variant="default" 
          onClick={onNewCommunityClick}
          className="bg-gradient-to-r from-[#26A5E4] to-[#0088CC] hover:from-[#33C3F0] hover:to-[#0090BD] gap-2 shadow-md hover:shadow-lg transition-all duration-300 text-xs py-1 h-8"
          size="sm"
        >
          <PlusCircle className="h-3 w-3" />
          New Community
        </Button>
      </motion.div>
    </div>
  );
};
