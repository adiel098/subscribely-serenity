
import React from 'react';
import { Community } from "@/group_owners/hooks/useCommunities";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { getBotUsername } from "@/telegram-mini-app/utils/telegram/botUsernameUtil";

export interface MiniAppLinkButtonProps {
  community: Community;
  onCopySuccess?: () => void; // Added onCopySuccess prop
}

export const MiniAppLinkButton: React.FC<MiniAppLinkButtonProps> = ({ 
  community, 
  onCopySuccess 
}) => {
  const botUsername = getBotUsername();
  
  const handleCopyLink = async () => {
    try {
      const linkParam = community.custom_link || community.id;
      const fullLink = `https://t.me/${botUsername}?start=${linkParam}`;
      
      await navigator.clipboard.writeText(fullLink);
      
      if (onCopySuccess) {
        onCopySuccess();
      }
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };
  
  return (
    <Button
      variant="outline"
      onClick={handleCopyLink}
      className="bg-white/50 hover:bg-white/80 text-xs h-8 border-indigo-100"
    >
      <Copy className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
      <span>Copy Link</span>
    </Button>
  );
};
