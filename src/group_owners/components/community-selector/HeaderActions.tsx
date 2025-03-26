
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
      // אם משתמש בבוט קאסטום
      if (isCustomBot) {
        // אם יש טוקן לבוט קאסטום, נפנה לדף יצירת קהילה עם בוט קאסטום
        if (hasCustomBotToken) {
          navigate("/new-community/custom-bot");
        } else {
          // אם אין טוקן, נפנה לדף הגדרות הבוט כדי שהמשתמש יוכל להגדיר את הטוקן
          navigate("/telegram-bot");
        }
      } else {
        // אם משתמש בבוט הרשמי, נפנה לדף חיבור טלגרם הרגיל
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
        className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 gap-2 ${isMobile ? 'px-3 text-xs py-1 h-8' : ''}`}
        onClick={handleNewCommunityClick}
        size={isMobile ? "sm" : "default"}
      >
        <PlusCircle className={`${isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
        {isMobile ? 'Community' : 'New Community'}
      </Button>
    </motion.div>
  );
};
