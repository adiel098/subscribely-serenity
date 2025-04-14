
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/contexts/AuthContext";

interface UseCustomBotValidationProps {
  onComplete: () => void;
}

export const useCustomBotValidation = ({ onComplete }: UseCustomBotValidationProps) => {
  const [customTokenInput, setCustomTokenInput] = useState<string>("");
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationSuccess, setValidationSuccess] = useState<boolean | null>(null);
  const [botChatList, setBotChatList] = useState<any[]>([]);
  const { user } = useAuth();

  const validateBotToken = async () => {
    if (!customTokenInput) {
      toast.error("Please enter a valid bot token");
      return;
    }

    setIsValidating(true);
    try {
      const response = await supabase.functions.invoke("validate-bot-token", {
        body: { 
          botToken: customTokenInput,
          communityId: null // Will be associated with all communities
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data.valid) {
        setValidationSuccess(true);
        setBotChatList(response.data.chatList || []);
        
        // Save the token in the users table directly
        if (user?.id) {
          await supabase
            .from('users')
            .update({ custom_bot_token: customTokenInput })
            .eq('id', user.id);
        }
        
        toast.success("Bot token validated successfully!");
        
        // Small delay before continuing to next step
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        setValidationSuccess(false);
        toast.error(`Invalid bot token: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error validating bot token:", error);
      setValidationSuccess(false);
      toast.error("Failed to validate bot token. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  return {
    customTokenInput,
    setCustomTokenInput,
    isValidating,
    validationSuccess,
    botChatList,
    validateBotToken
  };
};
