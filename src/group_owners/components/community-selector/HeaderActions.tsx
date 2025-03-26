import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useUserBotPreference } from "@/group_owners/hooks/useUserBotPreference";
import { useNavigate } from "react-router-dom";

interface HeaderActionsProps {
  onNewCommunityClick?: () => void;
  isMobile?: boolean;
}

export const HeaderActions = ({ onNewCommunityClick, isMobile = false }: HeaderActionsProps) => {
  const { isCustomBot, hasCustomBotToken } = useUserBotPreference();
  const navigate = useNavigate();

  const handleNewCommunityClick = () => {
    if (onNewCommunityClick) {
      onNewCommunityClick();
    } else {
      // If using custom bot
      if (isCustomBot) {
        // If there's a custom bot token, go to custom bot community creation
        if (hasCustomBotToken) {
          navigate("/new-community/custom-bot");
        } else {
          // If no token, go to bot settings so user can set the token
          navigate("/telegram-bot");
        }
      } else {
        // If using official bot, go to regular Telegram connect
        navigate("/connect/telegram");
      }
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button 
        className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow hover:shadow-md transition-all duration-300 gap-1.5 ${isMobile ? 'px-2 text-xs py-1 h-7' : 'h-8 text-xs px-3'}`}
        onClick={handleNewCommunityClick}
        size="sm"
        data-testid="create-community-button"
      >
        <PlusCircle className={`${isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
        {isMobile ? 'New' : 'New Community'}
      </Button>
    </motion.div>
  );
};
