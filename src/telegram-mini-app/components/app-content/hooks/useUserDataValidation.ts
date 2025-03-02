
import { useCallback } from "react";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { checkUserExists } from "@/telegram-mini-app/services/userProfileService";
import { useToast } from "@/components/ui/use-toast";

interface UseUserDataValidationProps {
  setIsCheckingUserData: (isChecking: boolean) => void;
  setShowEmailForm: (show: boolean) => void;
  setErrorState: (error: string | null) => void;
}

export const useUserDataValidation = ({
  setIsCheckingUserData,
  setShowEmailForm,
  setErrorState
}: UseUserDataValidationProps) => {
  const { toast } = useToast();

  const validateUserData = useCallback(async (telegramUser: TelegramUser) => {
    console.log('📱 Telegram ID for validation:', telegramUser.id);
    console.log('📱 Telegram ID type:', typeof telegramUser.id);
    
    // Set checking to true
    setIsCheckingUserData(true);
    
    // IMPORTANT: Set showEmailForm to true by default
    // This ensures the email form shows immediately, even during validation
    if (!telegramUser.email) {
      console.log('🔴 PROACTIVE EMAIL FORM: Setting email form to show immediately');
      setShowEmailForm(true);
    }
    
    try {
      if (!telegramUser.id) {
        console.error('❌ Missing Telegram ID:', telegramUser);
        setErrorState("Missing Telegram user ID");
        setIsCheckingUserData(false);
        return;
      }
      
      // Make sure we have a string ID
      const telegramId = String(telegramUser.id).trim();
      console.log('📱 Processed Telegram ID:', telegramId);
      
      if (!/^\d+$/.test(telegramId)) {
        console.error('❌ Invalid Telegram ID format for database check:', telegramId);
        console.error('❌ Full user object:', JSON.stringify(telegramUser));
        setErrorState("Invalid Telegram user ID format");
        setIsCheckingUserData(false);
        return;
      }
      
      // Only check if user exists, don't create the user here
      const { exists, hasEmail } = await checkUserExists(telegramId);
      console.log('📊 User exists in DB:', exists, 'Has email:', hasEmail);
      
      // Enforce email collection in ALL cases where either:
      // 1. User is new (not in DB) OR
      // 2. User exists but doesn't have an email
      if (!exists || !hasEmail) {
        console.log('🔴 EMAIL REQUIRED: User needs to provide email before proceeding');
        
        // Force showing email form - this is critical
        setShowEmailForm(true);
      } else {
        console.log('✅ User exists and has email, proceeding to community page');
        // User has email, proceed directly to community page
        setShowEmailForm(false);
      }
      
      setErrorState(null);
    } catch (error) {
      console.error('❌ Error checking user data:', error);
      // Default to showing email form if there's an error checking the database
      toast({
        variant: "destructive",
        title: "Error checking user data",
        description: "We'll ask for your information to ensure access."
      });
      setShowEmailForm(true);
      setErrorState(null);
    } finally {
      setIsCheckingUserData(false);
    }
  }, [setIsCheckingUserData, setShowEmailForm, setErrorState, toast]);

  return { validateUserData };
};
