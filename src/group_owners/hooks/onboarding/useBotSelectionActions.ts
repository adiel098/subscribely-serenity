
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
      
      // Store the bot token preference directly in user profile
      if (selected === "custom") {
        // For custom bot, we just set the flag but the actual token will be set later
        await supabase
          .from('users')
          .update({ custom_bot_token: 'pending' }) // We'll update this with actual token later
          .eq('id', userId);
          
        toast.success("Custom bot selected. Please provide your bot token in the next step.");
        
        // Navigate to custom bot setup
        navigate("/onboarding/custom-bot-setup");
      } else {
        // For official bot, clear any existing custom bot token
        await supabase
          .from('users')
          .update({ custom_bot_token: null })
          .eq('id', userId);
          
        toast.success("Official bot selected successfully");
        
        // Skip directly to completion step
        saveCurrentStep("completion");
        navigate("/onboarding/completion");
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
