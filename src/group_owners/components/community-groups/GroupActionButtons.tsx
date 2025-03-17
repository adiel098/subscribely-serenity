
import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Edit, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface GroupActionButtonsProps {
  onCopyLink: () => void;
  onShowDetails: () => void;
}

export const GroupActionButtons = ({ onCopyLink, onShowDetails }: GroupActionButtonsProps) => {
  return (
    <div className="flex items-center gap-2">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          onClick={onCopyLink} 
          size="sm"
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white gap-2 shadow-md hover:shadow-lg transition-all duration-300 text-xs py-1 h-8 font-medium"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy Group Link
        </Button>
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          onClick={onShowDetails} 
          size="sm"
          variant="outline"
          className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 h-8"
        >
          <Edit className="h-3.5 w-3.5" />
          Edit Group
        </Button>
      </motion.div>
    </div>
  );
};
