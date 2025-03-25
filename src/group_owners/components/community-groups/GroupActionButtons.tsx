
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Copy } from "lucide-react";
import { motion } from "framer-motion";

interface GroupActionButtonsProps {
  onCopyLink: () => void;
  onShowDetails: () => void;
}

export const GroupActionButtons = ({ onCopyLink, onShowDetails }: GroupActionButtonsProps) => {
  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCopyLink}
        className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
        title="Copy link"
      >
        <Copy className="h-3 w-3" />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onShowDetails}
        className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
        title="Edit link"
      >
        <Edit className="h-3 w-3" />
      </motion.button>
    </div>
  );
};
