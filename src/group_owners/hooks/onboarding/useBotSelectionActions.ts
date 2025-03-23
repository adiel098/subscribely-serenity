
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseBotSelectionActionsProps {
  userId: string | undefined;
  onComplete: () => void;
}

export const useBotSelectionActions = ({ userId, onComplete }: UseBotSelectionActionsProps) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<"official" | "custom" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const saveBotSelection = async () => {
    if (!selected || !userId) {
      toast.error("Please select a bot type first");
      return;
    }

    setIsLoading(true);
    try {
      console.log(`Saving bot selection: ${selected}`);
      
      // Set the custom bot preference in the global settings for this user
      await supabase.rpc('set_bot_preference', { 
        use_custom: selected === "custom"
      });
      
      toast.success(`${selected === "official" ? "Official" : "Custom"} bot selected successfully`);
      
      if (selected === "custom") {
        // Navigate to custom bot setup directly
        navigate("/onboarding/custom-bot-setup");
      } else {
        // For official bot, continue with standard flow
        console.log("Selected official bot, calling onComplete to navigate to the next step");
        onComplete();
      }
    } catch (error) {
      console.error("Error saving bot selection:", error);
      toast.error("Failed to save your bot selection. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selected,
    setSelected,
    isLoading,
    saveBotSelection
  };
};
