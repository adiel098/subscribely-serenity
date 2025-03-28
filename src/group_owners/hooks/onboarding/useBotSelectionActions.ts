
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOnboarding } from "../useOnboarding";

interface UseBotSelectionActionsProps {
  userId: string | undefined;
  onComplete: () => void;
}

export const useBotSelectionActions = ({ userId, onComplete }: UseBotSelectionActionsProps) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<"official" | "custom" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { saveCurrentStep } = useOnboarding();

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
        // For custom bot, navigate to custom bot setup
        navigate("/onboarding/custom-bot-setup");
      } else {
        // For official bot, skip directly to connect-telegram step
        // This fixes the issue where it was incorrectly going to official-bot-setup
        saveCurrentStep("connect-telegram");
        navigate("/onboarding/connect-telegram");
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
