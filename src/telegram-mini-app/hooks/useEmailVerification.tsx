
import { useState, useEffect } from "react";
import { TelegramUser } from "../types/app.types";
import { supabase } from "@/integrations/supabase/client";

interface UseEmailVerificationProps {
  telegramUser: TelegramUser | null;
  toast: any;
}

export const useEmailVerification = ({ telegramUser, toast }: UseEmailVerificationProps) => {
  const [manualEmailCollection, setManualEmailCollection] = useState(false);
  
  // Check if user has email in database when user data is loaded
  useEffect(() => {
    if (!telegramUser?.id) return;
    
    const checkUserEmail = async () => {
      try {
        console.log("Checking if user has email:", telegramUser.id);
        
        const { data: existingUser, error } = await supabase
          .from('telegram_mini_app_users')
          .select('email')
          .eq('telegram_id', telegramUser.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error checking user:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to verify user data. Please try again.",
          });
          return;
        }
        
        if (!existingUser || !existingUser.email) {
          console.log("User needs to provide email");
          setManualEmailCollection(true);
        } else {
          console.log("User already has email:", existingUser.email);
          setManualEmailCollection(false);
        }
      } catch (error) {
        console.error("Error in checkUserEmail:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to check user data. Please try again.",
        });
      }
    };
    
    checkUserEmail();
  }, [telegramUser?.id, toast]);

  return {
    manualEmailCollection,
    setManualEmailCollection
  };
};
