
import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface GroupActionButtonsProps {
  onCopyLink: () => void;
  onShowDetails: () => void;
}

export const GroupActionButtons = ({ onCopyLink, onShowDetails }: GroupActionButtonsProps) => {
  return (
    <div className="flex items-center gap-2">
      {/* Both buttons have been removed as requested */}
    </div>
  );
};
