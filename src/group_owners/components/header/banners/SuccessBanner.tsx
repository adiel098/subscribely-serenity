import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, Copy, CheckCircle, Edit, Settings } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getBotUsername } from "@/telegram-mini-app/utils/telegram/botUsernameUtil";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

interface SuccessBannerProps {
  communityId: string;
  customLink: string | null;
  onOpenEditDialog: () => void;
  entityType?: 'community' | 'group';
}

export const SuccessBanner: React.FC<SuccessBannerProps> = ({
  communityId,
  customLink,
  onOpenEditDialog,
  entityType = 'community'
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [copySuccess, setCopySuccess] = useState(false);
  const botUsername = getBotUsername();
  const isMobile = useIsMobile();
  const entityName = entityType.charAt(0).toUpperCase() + entityType.slice(1);
  const isGroup = entityType === 'group';

  const copyMiniAppLink = () => {
    if (!communityId) return;
    
    const miniAppUrl = customLink 
      ? `https://t.me/${botUsername}?start=${customLink}`
      : `https://t.me/${botUsername}?start=${communityId}`;
      
    navigator.clipboard.writeText(miniAppUrl)
      .then(() => {
        setCopySuccess(true);
        toast({
          title: "✨ Link Copied Successfully! ✨",
          description: "Your Mini App link is ready to share! 🚀",
          className: "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 text-indigo-800 shadow-md",
          duration: 3000,
        });
        
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error("Failed to copy link: ", err);
        toast({
          title: "Copy failed",
          description: "Could not copy the link to clipboard",
          variant: "destructive",
        });
      });
  };
  
  // Navigate to edit group page
  const handleEditGroup = () => {
    if (communityId) {
      navigate(`/groups/${communityId}/edit`);
    }
  };

  // For mobile, just show the buttons
  if (isMobile) {
    return null; // Don't show anything in mobile since we moved the buttons to the header
  }

  // For desktop, show the full banner
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0 bg-emerald-100 rounded-full p-1">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
        </div>
        <span className="text-sm text-emerald-800">Your {entityName} is ready! 🎉</span>
      </div>
      
      <div className="flex items-center gap-2 ml-2 bg-white/70 rounded-md px-2 py-1 border border-emerald-100 min-w-[300px] max-w-[400px]">
        <Link className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
        <span className="text-xs text-emerald-700 font-mono truncate">
          t.me/{botUsername}?start={customLink || communityId?.substring(0, 8) + "..."}
        </span>
      </div>
      
      <div className="flex items-center gap-1 ml-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={copyMiniAppLink}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${
            copySuccess 
              ? "bg-emerald-200 text-emerald-800" 
              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          }`}
          title="Copy link"
        >
          {copySuccess ? (
            <CheckCircle className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </motion.button>
        
        {isGroup ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEditGroup}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            title="Edit group details"
          >
            <Settings className="h-3 w-3" />
            <span>Edit Group</span>
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenEditDialog}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            title="Edit link"
          >
            <Edit className="h-3 w-3" />
          </motion.button>
        )}
        
      </div>
    </motion.div>
  );
};
