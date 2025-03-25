
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useBotSettings } from "@/group_owners/hooks/useBotSettings";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/contexts/AuthContext";

interface HeaderActionsProps {
  onNewCommunityClick: () => void;
}

export const HeaderActions = ({ onNewCommunityClick }: HeaderActionsProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [useCustomBot, setUseCustomBot] = useState<boolean>(false);
  
  // Check if the user has custom bot enabled in their settings
  useEffect(() => {
    const checkCustomBotSetting = async () => {
      if (!user) return;
      
      try {
        // First check if the user has any bot settings
        const { data, error } = await supabase
          .from('telegram_bot_settings')
          .select('use_custom_bot')
          .eq('owner_id', user.id)
          .limit(1)
          .single();
        
        if (error) {
          console.error('Error fetching bot settings:', error);
          return;
        }
        
        if (data) {
          console.log('User bot settings found:', data);
          setUseCustomBot(data.use_custom_bot);
        }
      } catch (error) {
        console.error('Error checking custom bot setting:', error);
      }
    };
    
    checkCustomBotSetting();
  }, [user]);
  
  const handleNewCommunity = () => {
    console.log('Current custom bot setting:', useCustomBot);
    
    if (useCustomBot) {
      navigate("/new-community/custom-bot");
    } else {
      navigate("/connect/telegram");
    }
  };

  return (
    <div className="flex items-center gap-4 ml-auto">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          variant="default" 
          onClick={handleNewCommunity}
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
