
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TelegramUser } from "../types/app.types";

interface UseUserEmailProps {
  telegramUser: TelegramUser | null;
}

export const useUserEmail = ({ telegramUser }: UseUserEmailProps) => {
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    // Check if user has email in the database when telegramUser changes
    if (telegramUser?.id) {
      checkUserEmail(telegramUser.id);
    }
  }, [telegramUser]);

  const checkUserEmail = async (telegramId: string) => {
    try {
      const { data, error } = await supabase
        .from('telegram_mini_app_users')
        .select('email')
        .eq('telegram_id', telegramId)
        .single();
      
      if (error) throw error;
      
      // If user doesn't have an email, show the email collection form
      setShowEmailForm(!data.email);
      
    } catch (error) {
      console.error("Error checking user email:", error);
      // Default to showing the form if there's an error
      setShowEmailForm(true);
    }
  };

  const handleEmailFormComplete = () => {
    setShowEmailForm(false);
  };

  return { showEmailForm, handleEmailFormComplete };
};
